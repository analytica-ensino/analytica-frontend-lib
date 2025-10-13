import { describe, it, expect } from '@jest/globals';
import * as AccordionModule from './index';

describe('Accordation index exports', () => {
  it('should export CardAccordation component', () => {
    expect(AccordionModule.CardAccordation).toBeDefined();
    expect(typeof AccordionModule.CardAccordation).toBe('object');
  });

  it('should export AccordionGroup component', () => {
    expect(AccordionModule.AccordionGroup).toBeDefined();
    expect(typeof AccordionModule.AccordionGroup).toBe('object');
  });

  it('should have all expected exports', () => {
    const exports = Object.keys(AccordionModule);

    expect(exports).toContain('CardAccordation');
    expect(exports).toContain('AccordionGroup');

    // Should only have these exports
    expect(exports).toHaveLength(2);
  });

  it('should have correct displayNames', () => {
    expect(AccordionModule.CardAccordation.displayName).toBe('CardAccordation');
    expect(AccordionModule.AccordionGroup.displayName).toBe('AccordionGroup');
  });
});
