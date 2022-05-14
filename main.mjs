#!/usr/bin/env node

import { watch } from 'chokidar'
import { spawn } from 'node:child_process'
import kill from 'tree-kill'

const args = process.argv.slice(2)

if(args.length < 2) {
    process.exit()
}

function createProcess(args) {
    const command = args[0]
    const commandOptions = [...args.slice(1)]

    // console.log({ command, commandOptions })

    const spawnedProcess = spawn(command, commandOptions)

    spawnedProcess.stdout.setEncoding('utf8')
    spawnedProcess.stdout.on('data', data => {
        console.log(data.toString())
    })

    spawnedProcess.stderr.setEncoding('utf8')
    spawnedProcess.stderr.on('data', data => {
        console.error('\x1b[31m', data.toString(), '\x1b[0m')
    })

    return spawnedProcess
}

let spawnedProcess = createProcess(args)

watch('**/*.js').on('change', async(file, stats) => {
    kill(spawnedProcess.pid, () => {
        spawnedProcess = null
        console.log('Changed: ' + file)
        console.log('Reloading...')
        spawnedProcess = createProcess(args)
    })
})
