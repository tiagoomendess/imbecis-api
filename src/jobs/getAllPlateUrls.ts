import { getPlatesOfConfirmedImbeciles } from "../models/plate"

export const getAllPlateUrls = async () => {
    let page = 1
    let platesResponse = await getPlatesOfConfirmedImbeciles(page)

    while (platesResponse.plates.length > 0) {
        for (const plate of platesResponse.plates) {
            console.log(`https://imbecis.app/matriculas/${plate.country}/${plate.number}`)
        }

        page++
        platesResponse = await getPlatesOfConfirmedImbeciles(page)
    }

    console.log("Finished")
}

getAllPlateUrls()
