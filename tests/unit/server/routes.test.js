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

const {
    pages,
    location,
    constants: {
        CONTENT_TYPE
    }
} = config

describe('#Routes - test site for api response', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    test('GET / - shold redirect to home page', async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/'

        await handler(...params.values())
        expect(params.response.writeHead).toBeCalledWith(302, {
            'Location': location.home
        })
        expect(params.response.end).toHaveBeenCalled()
    })

    test('GET /home - shold response with ${pages.homeHTML} file stream', async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/home'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /controller - shold response with ${pages.controllerHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/controller'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /index.html - shold response with file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        const fileName = '/index.html'
        params.request.url = fileName
        const expectedType = '.html'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).toHaveBeenCalledWith(
            200, {
            'Content-Type': CONTENT_TYPE[expectedType]
        }
        )
    })

    test(`GET /file.ext - shold response with file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        const fileName = '/file.ext'
        params.request.url = fileName
        const expectedType = '.ext'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).not.toHaveBeenCalled()
    })

    test(`GET /unknow - given an inexistent route it should response with 404`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'POST'
        params.request.url = '/unknow'

        await handler(...params.values())
        expect(params.response.writeHead).toHaveBeenCalledWith(404)
        expect(params.response.end).toHaveBeenCalled()
    })

    test('GET /stream?id=123456 - should call createClientStream', async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/stream'
        const stream = TestUtil.generateReadableStream(['test'])
        jest.spyOn(
            stream,
            "pipe"
        ).mockReturnValue()

        const onClose = jest.fn()
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.createClientStream.name
        )
        .mockReturnValue({
            onClose,
            stream
        })

        await handler(...params.values())
        params.request.emit('close')

        expect(params.response.writeHead).toHaveBeenCalledWith(
            200, {
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes',
        })

        expect(Controller.prototype.createClientStream).toHaveBeenCalled()
        expect(stream.pipe).toHaveBeenCalledWith(params.response)
        expect(onClose).toHaveBeenCalled()
    })

    test('POST /controller - should call handleCommand', async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'POST'
        params.request.url = '/controller'
        const body = {
            command: 'start'
        }

        params.request.push(JSON.stringify(body))
        const jsonResult = {
            ok: '1'
        }
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.handleCommand.name
        )
        .mockResolvedValue(jsonResult)

        await handler(...params.values())

        expect(Controller.prototype.handleCommand).toHaveBeenCalledWith(body)
        expect(params.response.end).toHaveBeenCalledWith((JSON.stringify(jsonResult)))
    })

    describe('exceptions', () => {
        test('given inexistent file it should respond with 404', async () => {
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name,
            ).mockRejectedValue(new Error('Error: ENOENT: no such file or directy'))

            await handler(...params.values())
            expect(params.response.writeHead).toHaveBeenCalledWith(404)
            expect(params.response.end).toHaveBeenCalled()
        })

        test('given an error it should respond with 500', async () => {
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name,
            ).mockRejectedValue(new Error('Error:'))

            await handler(...params.values())
            expect(params.response.writeHead).toHaveBeenCalledWith(500)
            expect(params.response.end).toHaveBeenCalled()
        })
    })
})