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
        })
        const controller = new Controller()

        await controller.getFileStream(pages.homeHTML)
        expect(controller.service.getFileStream).toHaveBeenCalledWith(pages.homeHTML)
    })

})