import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals'
import config from '../../../server/config.js'
import TestUtil from '../_util/testUtil.js';
import { Controller } from '../../../server/controller.js';
import { Service } from '../../../server/service.js';

const {
    pages
} = config

describe('#Controller - test for controller', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    test('getFileStream - shold call getFileStream with filename', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Service.prototype,
            Service.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: '.html'
        })
        const controller = new Controller()

        const controllerReturn = await controller.getFileStream(pages.homeHTML)
        expect(controller.service.getFileStream).toHaveBeenCalledWith(pages.homeHTML)
        expect(controllerReturn).toStrictEqual({
            stream: mockFileStream,
            type: '.html'
        })
    })

    describe('handleCommand', () => {
        test('shold call startStreamming And return ok', async () => {
            jest.spyOn(
                Service.prototype,
                Service.prototype.startStreamming.name,
            ).mockResolvedValue()

            const controller = new Controller()
            const command = { command: 'start' }

            const controllerReturn = await controller.handleCommand(command)

            expect(Service.prototype.startStreamming).toHaveBeenCalled()
            expect(controllerReturn).toStrictEqual({
                result: 'ok'
            })
        })

        test('shold call stopStreamming And return ok', async () => {
            jest.spyOn(
                Service.prototype,
                Service.prototype.stopStreamming.name,
            ).mockResolvedValue()

            const controller = new Controller()
            const command = { command: 'stop' }

            const controllerReturn = await controller.handleCommand(command)

            expect(Service.prototype.stopStreamming).toHaveBeenCalled()
            expect(controllerReturn).toStrictEqual({
                result: 'ok'
            })
        })

        test('shold call handleCommand And not call stopStreamming and startStreamming and return ok', async () => {
            jest.spyOn(
                Service.prototype,
                Service.prototype.startStreamming.name,
            ).mockResolvedValue()
            jest.spyOn(
                Service.prototype,
                Service.prototype.stopStreamming.name,
            ).mockResolvedValue()

            const controller = new Controller()
            const command = { command: 'not' }

            const controllerReturn = await controller.handleCommand(command)

            expect(Service.prototype.startStreamming).not.toHaveBeenCalled()
            expect(Service.prototype.stopStreamming).not.toHaveBeenCalled()
            expect(controllerReturn).toStrictEqual({
                result: 'ok'
            })
        })
    })

    describe('createClientStream', () => {
        test('shold call startStreamming And return ok', async () => {
            const mockStream = TestUtil.generateReadableStream(['test'])
            jest.spyOn(
                Service.prototype,
                Service.prototype.createClientStream.name,
            ).mockReturnValue({
                id: '123456',
                clientStream: mockStream
            })
            jest.spyOn(
                Service.prototype,
                Service.prototype.removeClientStream.name,
            ).mockReturnValue(null)

            const controller = new Controller()
            const command = { command: 'start' }

            const {
                stream,
                onClose
            } = controller.createClientStream(command)

            onClose()

            expect(Service.prototype.createClientStream).toHaveBeenCalled()
            expect(Service.prototype.removeClientStream).toHaveBeenCalledWith('123456')
            expect(stream).toStrictEqual(mockStream)
        })
    })

})