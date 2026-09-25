return {
    -- Keybind for opening the radial menu
    keyBind = 'ESCAPE',

    camera = true, -- Enable or disable the camera effect when opening the pause menu

    menu = {
        {
            {
                label = 'Radar',
                icon = 'fa-map',
                action = {
                    type = 'clientEvent',
                    event = 'err_pausemenu:openRadar',
                },
            },
            {
                label = 'Store',
                icon = 'fa-globe',
                action = {
                    type = 'url',
                    event = 'https://err-scripts.xyz',
                },
            },
        },
        {
            {
                label = 'Settings',
                icon = 'fa-gear',
                action = {
                    type = 'clientEvent',
                    event = 'err_pausemenu:openSettings',
                },
            },
            {
                label = 'Keybinds',
                icon = 'fa-keyboard',
                action = {
                    type = 'clientEvent',
                    event = 'err_pausemenu:openKeybinds',
                },
            },
            {
                label = 'Discord',
                icon = 'fa-brands fa-discord',
                action = {
                    type = 'url',
                    event = 'https://discord.gg/yGUU59WjuM',
                },
            },
        },
        {
            {
                label = 'Close',
                icon = 'fa-circle-xmark',
                action = {
                    type = 'clientEvent',
                    event = 'err_pausemenu:close',
                },
            },
            {
                label = 'Disconnect',
                icon = 'fa-power-off',
                action = {
                    type = 'serverEvent',
                    event = 'err_pausemenu:quit',
                },
            },
        },
    },

    patchNote = {
        version = "1.0.0",
        releaseDate = "SEPT 12, 2026",
        patchTitle = "This week on the server",
        backgroundImage = "https://...............",
        highlights = {
            {
                type = "add",
                updates = {
                    { text = "Initial release of the pause menu." },
                },
            },
            {
                type = "improved",
                updates = {
                    { text = "Improved menu transitions." },
                    { text = "Reduced UI latency." },
                },
            },
            {
                type = "fixed",
                updates = {
                    { text = "Fixed animation flickering." },
                    { text = "Fixed animation flickering." },
                    { text = "Fixed animation flickering." },
                    { text = "Corrected character positioning issues." },
                },
            },
        },
    },
}