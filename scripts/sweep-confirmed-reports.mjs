#!/usr/bin/env node
// Sweeps GET /reports/confirmed page by page and writes each report item as a
// JSON Lines record to the output file. Runs with Node 18+ (no extra deps needed).

import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = 'https://api.imbecis.app/reports/confirmed'
const PAGE_SIZE = 50
const OUTPUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../output/confirmed-reports.jsonl')
const DELAY_MS = 200 // polite delay between requests

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchPage(page) {
    const url = `${BASE_URL}?page=${page}&pageSize=${PAGE_SIZE}`
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} on page ${page}: ${await res.text()}`)
    }
    return res.json()
}

async function main() {
    await mkdir(dirname(OUTPUT_FILE), { recursive: true })
    const out = createWriteStream(OUTPUT_FILE, { encoding: 'utf8' })

    let page = 1
    let totalPages = null
    let totalWritten = 0

    console.log(`Output → ${OUTPUT_FILE}`)
    console.log(`Page size: ${PAGE_SIZE}`)
    console.log('---')

    do {
        process.stdout.write(`Fetching page ${page}${totalPages ? `/${totalPages}` : ''}…`)

        const body = await fetchPage(page)

        if (!body.success) {
            throw new Error(`API returned success=false on page ${page}`)
        }

        totalPages = body.meta.totalPages

        for (const item of body.payload) {
            out.write(JSON.stringify(item) + '\n')
            totalWritten++
        }

        console.log(` got ${body.payload.length} items (total so far: ${totalWritten}/${body.meta.total})`)

        if (page >= totalPages) break
        page++

        await sleep(DELAY_MS)
    } while (true)

    await new Promise((res, rej) => out.end((err) => (err ? rej(err) : res())))

    console.log('---')
    console.log(`Done. ${totalWritten} records written to ${OUTPUT_FILE}`)
}

main().catch((err) => {
    console.error('Fatal:', err.message)
    process.exit(1)
})
