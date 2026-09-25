RegisterServerEvent('err_pausemenu:quit')
AddEventHandler('err_pausemenu:quit', function()
	DropPlayer(source, 'You disconnected from the server.')
end)