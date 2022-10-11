import { uuid } from "./utils";

test(`function ${uuid.name} should work correctly`, () => {
  Date.now = jest.fn(() => 1487076708000);
  window.performance.now = jest.fn(() => 1943667.0999999642);
  Math.random = jest.fn(() => 0.4);

  expect(uuid()).toEqual("97dd1229-0b76-4666-2666-666666666666");

  // @ts-ignore
  window.performance.now = undefined;
  expect(uuid()).toEqual("60423029-0b76-4666-2666-666666666666");
});
