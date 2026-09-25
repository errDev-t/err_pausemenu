local config = require 'shared.config'
local cam = nil
local open = false
local closing = false

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    Wait(1000)

    SendReactMessage("updateData", {
        patchNotes = config.patchNote,
        menuSections = config.menu
    })

    print('Pause menu resource started successfully')
end)

AddEventHandler("onResourceStop", function(resource)
    if cache.resource == resource and DoesCamExist(cam) then
        closeCam()
    end
end)

RegisterNetEvent("QBCore:Client:OnPlayerLoaded", function()
    Wait(2000)

    SendReactMessage("updateData", {
        patchNotes = config.patchNote,
        menuSections = config.menu
    })
    print('Pause menu resource started successfully')
end)

-- Function to check if the camera is facing forward relative to the player
-- @return bool - true if the camera is facing forward, false otherwise
function isCameraFacingForward()
    local playerPed = PlayerPedId()
    local playerHeading = GetEntityHeading(playerPed)
    local camRotation = GetGameplayCamRot(2)
    local camHeading = camRotation.z

    playerHeading = playerHeading % 360
    camHeading = camHeading % 360

    local headingDifference = math.abs(playerHeading - camHeading)

    if headingDifference > 180 then
        headingDifference = 360 - headingDifference
    end

    return headingDifference <= 90
end

-- Function to check if the inventory is open
-- @return bool - true if the inventory is open, false otherwise
function isInventoryOpen()
    local invOpen = LocalPlayer.state.invOpen
    return invOpen
end

function openCam()
    local vehicle = GetVehiclePedIsIn(cache.ped, false)

    if IsPedInAnyVehicle(cache.ped, false) then
        if vehicle ~= 0 and not IsThisModelABicycle(GetEntityModel(vehicle)) then
            return
        end
    end

    -- Freeze player and apply effects
    FreezeEntityPosition(cache.ped, true)

    SetTransitionTimecycleModifier('NG_filmic11', 0.2)
    SetTimecycleModifierStrength(0.56)

    local isCameraBehindPlayer = not isCameraFacingForward()
    local offsetY = isCameraBehindPlayer and 1.6 or -1.6
    local coords = GetOffsetFromEntityInWorldCoords(cache.ped, 0, offsetY, 0.55)

    -- Create camera
    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    SetCamCoord(cam, coords.x, coords.y, coords.z)

    -- Set rotation and point at ped's head bone
    local rotationZ = isCameraBehindPlayer
        and GetEntityHeading(cache.ped)
        or (GetEntityHeading(cache.ped) + 180) % 360

    SetCamRot(cam, 0.0, 0.0, rotationZ)

    if isCameraBehindPlayer then
        PointCamAtPedBone(cam, cache.ped, 31086, 0.5, -2.0, -0.03, true)
    else
        PointCamAtPedBone(cam, cache.ped, 31086, -0.5, 2.0, 0.03, true)
    end

    SetCamActive(cam, true)
    RenderScriptCams(true, true, 350, 1, 0)
    SetCamFov(cam, 38.0)

    TaskLookAtCoord(cache.ped, coords.x, coords.y, coords.z, 5000, 1, 1)
end

CreateThread(function()
    while true do
        Wait(0)

        if DoesCamExist(cam) then
            local ped = cache.ped

            local light = GetOffsetFromEntityInWorldCoords(ped, 0.9, 0.4, 0.9)
            DrawLightWithRange(light.x, light.y, light.z, 255, 248, 235, 1.8, 2.9)

            FadeUpPedLight(1)
            UpdateLightsOnEntity(ped)
            TaskLookAtCoord(ped, light.x, light.y, light.z, 4000, 1, 1)
        end
    end
end)

function closePM()
    if closing then return end
    closing = true
    ClearPedTasks(cache.ped)
    SetPedCanPlayAmbientAnims(cache.ped, true)
    SetNuiFocus(false, false)
    open = false

    if DoesCamExist(cam) then
        closeCam()
    else
        FreezeEntityPosition(cache.ped, false)
    end

    Wait(300)
    closing = false
end

function closeCam()
    ClearTimecycleModifier()
    RenderScriptCams(false, true, 410, true, false)
    SetCamActive(cam, false)
    DestroyCam(cam, true)
    FreezeEntityPosition(cache.ped, false)

    cam = nil
end

function showPauseMenu()
    SendReactMessage("showPause")
    SetNuiFocus(true, true)
    SetPedCanPlayAmbientAnims(cache.ped, false)
    if config.camera then openCam() end
    open = true
end

RegisterNUICallback('err_pausemenu:close', function(_, cb)
    if closing then
        cb({})
        return
    end

    closePM()

    cb({})
end)

RegisterNUICallback('err_pausemenu:click', function(data, cb)
    if data.type == 'clientEvent' then
        TriggerEvent(data.event)

    elseif data.type == 'serverEvent' then
        TriggerServerEvent(data.event)

    elseif data.type == 'export' then
        local resource, export = string.match(data.event, '(.+)%.(.+)')

        if resource and export then
            exports[resource][export]()
        end
    end

    cb(1)
end)

AddEventHandler('err_pausemenu:openSettings', function()
    ActivateFrontendMenu('FE_MENU_VERSION_LANDING_MENU', false, -1)
end)

AddEventHandler('err_pausemenu:openKeybinds', function()
    ActivateFrontendMenu(GetHashKey('FE_MENU_VERSION_LANDING_KEYMAPPING_MENU'), false, -1)
end)

AddEventHandler('err_pausemenu:openRadar', function()
    ActivateFrontendMenu('FE_MENU_VERSION_MP_PAUSE', false, -1)
end)

lib.addKeybind({
    name = 'pausemenu',
    description = 'Open Pause Menu',
    defaultKey = config.keyBind,
    allowInPauseMenu = false,
    onPressed = function()
        DisableControlAction(1, 200, true) -- maybe it is the cause of the crash if there is a crash just a note for me

        if open or closing then
            return
        end

        if isInventoryOpen() or IsPauseMenuActive() then
            return
        end

        showPauseMenu()
    end
})

exports('getPauseMenuState', function()
    return open
end)