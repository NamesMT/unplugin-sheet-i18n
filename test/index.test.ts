import { expect, it } from 'vitest'
import { shouldBe200 } from '~/index.js'
import { logger } from '~/logger'

it('shoudBe200', () => {
  expect(shouldBe200).toBe(200)
})

it('logger', () => {
  expect(logger).toHaveProperty('info')
})
