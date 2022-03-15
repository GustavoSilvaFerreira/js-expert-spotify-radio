import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals'
import config from '../../../server/config.js'
import TestUtil from '../_util/testUtil.js';
import { Service } from '../../../server/service.js';
import fs from 'fs'
import fsPromises from 'fs/promises'
import { join } from 'path'

const {
    pages,
    dir: {
        publicDirectory
    }
} = config

describe('#Service - test for service', () => {
    let service = null;
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        service = new Service()
    })

    test('createFileStream - shold call fs.createReadStream with filename', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            fs,
            fs.createReadStream.name,
        ).mockReturnValue(mockFileStream)

        const serviceReturn = service.createFileStream(pages.homeHTML)
        expect(fs.createReadStream).toHaveBeenCalledWith(pages.homeHTML)
        expect(serviceReturn).toEqual(mockFileStream)
    })

    test('getFileInfo - shold call fsPromises.access and return fileType and fullFilePath', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            fsPromises,
            fsPromises.access.name,
        ).mockReturnValue({
            stream: mockFileStream,
        })

        const response = await service.getFileInfo(pages.homeHTML)
        expect(fsPromises.access).toHaveBeenCalledWith(join(publicDirectory, pages.homeHTML))
        expect(response.type).toBe('.html')
        expect(response.name).toBe(join(publicDirectory, pages.homeHTML))
    })

    test('getFileStream - shold call createFileStream and return stream and type', async () => {
        const mockReturnObj = {
            name: pages.homeHTML,
            type: '.html'
        }
        jest.spyOn(
            service,
            service.getFileInfo.name,
        ).mockReturnValue(mockReturnObj)

        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            service,
            service.createFileStream.name,
        ).mockResolvedValue(mockFileStream)

        const response = await service.getFileStream(pages.homeHTML)
        expect(service.createFileStream).toHaveBeenCalledWith(mockReturnObj.name)
        expect(await response.stream).toEqual(mockFileStream)
        expect(response.type).toBe(mockReturnObj.type)
    })

})