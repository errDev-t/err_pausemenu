game 'gta5'
fx_version 'cerulean'
description 'ERR Pausemenu'
repository 'a Pausemenu made by ERR dev team with love <3'
version '1.0.0'

shared_script {
	'@ox_lib/init.lua',
}

client_script {
	"client/*.lua",
}

server_script {
	"server/*.lua",
}

ui_page "web/build/index.html"

files {
	'web/build/index.html',
	'web/build/**/*',
	'shared/*.lua',
}

escrow_ignore {
	'shared/*.lua',
}

lua54 'yes'