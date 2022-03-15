import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals'
import config from '../../../server/config.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_util/testUtil.js';
import { Controller } from '../../../server/controller.js';
import { Service } from '../../../server/service.js';
import fs from 'fs'
import fsPromises from 'fs/promises'
import { join, extname } from 'path'

const {
    pages,
    location,
    constants: {
        CONTENT_TYPE
    },
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
        ).mockResolvedValue({
            stream: mockFileStream,
        })

        await service.createFileStream(pages.homeHTML)
        expect(fs.createReadStream).toHaveBeenCalledWith(pages.homeHTML)
    })

    test('getFileInfo - shold call fsPromises.access and return fileType and fullFilePath', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            fsPromises,
            fsPromises.access.name,
        ).mockResolvedValue({
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
        ).mockResolvedValue(mockReturnObj)

        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            service,
            service.createFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
        })

        const response = await service.getFileStream(pages.homeHTML)
        expect(service.createFileStream).toHaveBeenCalledWith(mockReturnObj.name)
        // expect(await response.stream).toEqual(mockFileStream)
        expect(response.type).toBe(mockReturnObj.type)
    })

    // test('createFileStream', async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'GET'
    //     params.request.url = '/'

    //     await handler(...params.values())
    //     expect(params.response.writeHead).toBeCalledWith(302, {
    //         'Location': location.home
    //     })
    //     expect(params.response.end).toHaveBeenCalled()
    // })

    // test('GET /home - shold response with ${pages.homeHTML} file stream', async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'GET'
    //     params.request.url = '/home'
    //     const mockFileStream = TestUtil.generateReadableStream(['data'])
    //     jest.spyOn(
    //         Controller.prototype,
    //         Controller.prototype.getFileStream.name,
    //     ).mockResolvedValue({
    //         stream: mockFileStream,
    //     })
    //     jest.spyOn(
    //         mockFileStream,
    //         "pipe"
    //     ).mockReturnValue()

    //     await handler(...params.values())
    //     expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
    //     expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    // })

    // test(`GET /controller - shold response with ${pages.controllerHTML} file stream`, async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'GET'
    //     params.request.url = '/controller'
    //     const mockFileStream = TestUtil.generateReadableStream(['data'])
    //     jest.spyOn(
    //         Controller.prototype,
    //         Controller.prototype.getFileStream.name,
    //     ).mockResolvedValue({
    //         stream: mockFileStream,
    //     })
    //     jest.spyOn(
    //         mockFileStream,
    //         "pipe"
    //     ).mockReturnValue()

    //     await handler(...params.values())
    //     expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
    //     expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    // })

    // test(`GET /index.html - shold response with file stream`, async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'GET'
    //     const fileName = '/index.html'
    //     params.request.url = fileName
    //     const expectedType = '.html'
    //     const mockFileStream = TestUtil.generateReadableStream(['data'])
    //     jest.spyOn(
    //         Controller.prototype,
    //         Controller.prototype.getFileStream.name,
    //     ).mockResolvedValue({
    //         stream: mockFileStream,
    //         type: expectedType
    //     })
    //     jest.spyOn(
    //         mockFileStream,
    //         "pipe"
    //     ).mockReturnValue()

    //     await handler(...params.values())
    //     expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
    //     expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    //     expect(params.response.writeHead).toHaveBeenCalledWith(
    //         200, {
    //             'Content-Type': CONTENT_TYPE[expectedType]
    //         }
    //     )
    // })

    // test(`GET /file.ext - shold response with file stream`, async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'GET'
    //     const fileName = '/file.ext'
    //     params.request.url = fileName
    //     const expectedType = '.ext'
    //     const mockFileStream = TestUtil.generateReadableStream(['data'])
    //     jest.spyOn(
    //         Controller.prototype,
    //         Controller.prototype.getFileStream.name,
    //     ).mockResolvedValue({
    //         stream: mockFileStream,
    //         type: expectedType
    //     })
    //     jest.spyOn(
    //         mockFileStream,
    //         "pipe"
    //     ).mockReturnValue()

    //     await handler(...params.values())
    //     expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
    //     expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    //     expect(params.response.writeHead).not.toHaveBeenCalled()
    // })

    // test(`GET /unknow - given an inexistent route it should response with 404`, async () => {
    //     const params = TestUtil.defaultHandleParams()
    //     params.request.method = 'POST'
    //     params.request.url = '/unknow'

    //     await handler(...params.values())
    //     expect(params.response.writeHead).toHaveBeenCalledWith(404)
    //     expect(params.response.end).toHaveBeenCalled()
    // })

    // describe('exceptions', () => {
    //     test('given inexistent file it should respond with 404', async () => {
    //         const params = TestUtil.defaultHandleParams()
    //         params.request.method = 'GET'
    //         params.request.url = '/index.png'

    //         jest.spyOn(
    //             Controller.prototype,
    //             Controller.prototype.getFileStream.name,
    //         ).mockRejectedValue(new Error('Error: ENOENT: no such file or directy'))
    
    //         await handler(...params.values())
    //         expect(params.response.writeHead).toHaveBeenCalledWith(404)
    //         expect(params.response.end).toHaveBeenCalled()
    //     })

    //     test('given an error it should respond with 500', async () => {
    //         const params = TestUtil.defaultHandleParams()
    //         params.request.method = 'GET'
    //         params.request.url = '/index.png'

    //         jest.spyOn(
    //             Controller.prototype,
    //             Controller.prototype.getFileStream.name,
    //         ).mockRejectedValue(new Error('Error:'))
    
    //         await handler(...params.values())
    //         expect(params.response.writeHead).toHaveBeenCalledWith(500)
    //         expect(params.response.end).toHaveBeenCalled()
    //     })
    // })
})