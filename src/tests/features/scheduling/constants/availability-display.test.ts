import { DAY_OPTIONS } from '@/features/scheduling/constants/availability-display'

it('provides exactly one nonempty label for each weekday accepted by the API', () => {
  // CreateAvailabilityDto accepts integer weekdays 0..6. UI selection and
  // removal confirmation must describe every accepted weekday without fallback.
  expect(DAY_OPTIONS.map(({ value }) => value).sort()).toEqual([0, 1, 2, 3, 4, 5, 6])
  for (const { label } of DAY_OPTIONS) expect(label.trim()).not.toBe('')
})
