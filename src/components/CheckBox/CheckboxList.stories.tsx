import type { Story } from '@ladle/react';
import CheckboxList, { CheckboxListItem } from './CheckboxList';
import { useState } from 'react';

const sizes = ['small', 'medium', 'large'] as const;
const states = [
  'default',
  'hovered',
  'focused',
  'invalid',
  'disabled',
] as const;

/**
 * Default CheckboxList component showcase
 */
export const Default: Story = () => {
  const [selectedValues, setSelectedValues] = useState(['option1']);

  const toggleOption2 = () => {
    if (selectedValues.includes('option2')) {
      setSelectedValues(selectedValues.filter((value) => value !== 'option2'));
    } else {
      setSelectedValues([...selectedValues, 'option2']);
    }
  };

  const selectAll = () => {
    setSelectedValues(['option1', 'option2', 'option3']);
  };

  const clearAll = () => {
    setSelectedValues([]);
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Basic Usage with External Control
        </h3>
        <div className="flex flex-col gap-4">
          <CheckboxList
            values={selectedValues}
            onValuesChange={setSelectedValues}
          >
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option1" id="c1" />
              <label htmlFor="c1" className="cursor-pointer">
                Option 1
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option2" id="c2" />
              <label htmlFor="c2" className="cursor-pointer">
                Option 2
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option3" id="c3" />
              <label htmlFor="c3" className="cursor-pointer">
                Option 3
              </label>
            </div>
          </CheckboxList>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selected:</strong>{' '}
              {selectedValues.length > 0 ? selectedValues.join(', ') : 'None'}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={toggleOption2}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Toggle Option 2
            </button>
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Size variations
 */
export const Sizes: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        CheckboxList Sizes
      </h3>

      {/* Small Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Small</h4>
        <CheckboxList>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="small1" id="small-c1" size="small" />
            <label htmlFor="small-c1" className="cursor-pointer">
              Small Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="small2" id="small-c2" size="small" />
            <label htmlFor="small-c2" className="cursor-pointer">
              Small Option 2
            </label>
          </div>
        </CheckboxList>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (Default)
        </h4>
        <CheckboxList>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="medium1" id="medium-c1" size="medium" />
            <label htmlFor="medium-c1" className="cursor-pointer">
              Medium Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="medium2" id="medium-c2" size="medium" />
            <label htmlFor="medium-c2" className="cursor-pointer">
              Medium Option 2
            </label>
          </div>
        </CheckboxList>
      </div>

      {/* Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Large</h4>
        <CheckboxList>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="large1" id="large-c1" size="large" />
            <label htmlFor="large-c1" className="cursor-pointer">
              Large Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="large2" id="large-c2" size="large" />
            <label htmlFor="large-c2" className="cursor-pointer">
              Large Option 2
            </label>
          </div>
        </CheckboxList>
      </div>
    </div>
  </div>
);

/**
 * State variations
 */
export const States: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        CheckboxList States
      </h3>

      {/* Default State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Default</h4>
        <CheckboxList>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="default1" id="default-c1" />
            <label htmlFor="default-c1" className="cursor-pointer">
              Default Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="default2" id="default-c2" />
            <label htmlFor="default-c2" className="cursor-pointer">
              Default Option 2
            </label>
          </div>
        </CheckboxList>
      </div>

      {/* Invalid State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Invalid</h4>
        <CheckboxList>
          <div className="flex items-center gap-3">
            <CheckboxListItem
              value="invalid1"
              id="invalid-c1"
              state="invalid"
            />
            <label htmlFor="invalid-c1" className="cursor-pointer">
              Invalid Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem
              value="invalid2"
              id="invalid-c2"
              state="invalid"
            />
            <label htmlFor="invalid-c2" className="cursor-pointer">
              Invalid Option 2
            </label>
          </div>
        </CheckboxList>
      </div>

      {/* Disabled State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Disabled</h4>
        <CheckboxList disabled>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="disabled1" id="disabled-c1" />
            <label htmlFor="disabled-c1" className="cursor-pointer">
              Disabled Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="disabled2" id="disabled-c2" />
            <label htmlFor="disabled-c2" className="cursor-pointer">
              Disabled Option 2
            </label>
          </div>
        </CheckboxList>
      </div>
    </div>
  </div>
);

/**
 * Multiple selection showcase
 */
export const MultipleSelection: Story = () => {
  const [selectedValues, setSelectedValues] = useState(['option1', 'option3']);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Multiple Selection
        </h3>
        <div className="flex flex-col gap-4">
          <CheckboxList
            values={selectedValues}
            onValuesChange={setSelectedValues}
          >
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option1" id="multi-c1" />
              <label htmlFor="multi-c1" className="cursor-pointer">
                Option 1
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option2" id="multi-c2" />
              <label htmlFor="multi-c2" className="cursor-pointer">
                Option 2
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option3" id="multi-c3" />
              <label htmlFor="multi-c3" className="cursor-pointer">
                Option 3
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option4" id="multi-c4" />
              <label htmlFor="multi-c4" className="cursor-pointer">
                Option 4
              </label>
            </div>
          </CheckboxList>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selected:</strong>{' '}
              {selectedValues.length > 0 ? selectedValues.join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Complex layout example
 */
export const ComplexLayout: Story = () => {
  const [selectedValues, setSelectedValues] = useState([
    'feature1',
    'feature3',
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Complex Layout
        </h3>
        <div className="max-w-md">
          <CheckboxList
            values={selectedValues}
            onValuesChange={setSelectedValues}
            className="space-y-3"
          >
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <CheckboxListItem
                value="feature1"
                id="feature1"
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="feature1"
                  className="cursor-pointer font-medium"
                >
                  Feature 1
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  This is a description of feature 1
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <CheckboxListItem
                value="feature2"
                id="feature2"
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="feature2"
                  className="cursor-pointer font-medium"
                >
                  Feature 2
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  This is a description of feature 2
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <CheckboxListItem
                value="feature3"
                id="feature3"
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="feature3"
                  className="cursor-pointer font-medium"
                >
                  Feature 3
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  This is a description of feature 3
                </p>
              </div>
            </div>
          </CheckboxList>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selected:</strong>{' '}
              {selectedValues.length > 0 ? selectedValues.join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Multiple independent groups
 */
export const MultipleGroups: Story = () => {
  const [group1Values, setGroup1Values] = useState(['a1']);
  const [group2Values, setGroup2Values] = useState(['b1', 'b2']);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Multiple Independent Groups
        </h3>
        <div className="space-y-8">
          <div>
            <h4 className="font-medium text-md mb-2 text-text-950">Group 1</h4>
            <CheckboxList
              values={group1Values}
              onValuesChange={setGroup1Values}
              name="group1"
            >
              <div className="flex items-center gap-3">
                <CheckboxListItem value="a1" id="g1-a1" />
                <label htmlFor="g1-a1" className="cursor-pointer">
                  Group 1 Option A
                </label>
              </div>
              <div className="flex items-center gap-3">
                <CheckboxListItem value="a2" id="g1-a2" />
                <label htmlFor="g1-a2" className="cursor-pointer">
                  Group 1 Option B
                </label>
              </div>
            </CheckboxList>
            <p className="text-sm text-gray-600 mt-2">
              Selected: {group1Values.join(', ') || 'None'}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-md mb-2 text-text-950">Group 2</h4>
            <CheckboxList
              values={group2Values}
              onValuesChange={setGroup2Values}
              name="group2"
            >
              <div className="flex items-center gap-3">
                <CheckboxListItem value="b1" id="g2-b1" />
                <label htmlFor="g2-b1" className="cursor-pointer">
                  Group 2 Option A
                </label>
              </div>
              <div className="flex items-center gap-3">
                <CheckboxListItem value="b2" id="g2-b2" />
                <label htmlFor="g2-b2" className="cursor-pointer">
                  Group 2 Option B
                </label>
              </div>
              <div className="flex items-center gap-3">
                <CheckboxListItem value="b3" id="g2-b3" />
                <label htmlFor="g2-b3" className="cursor-pointer">
                  Group 2 Option C
                </label>
              </div>
            </CheckboxList>
            <p className="text-sm text-gray-600 mt-2">
              Selected: {group2Values.join(', ') || 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * With individual disabled items
 */
export const WithDisabledItems: Story = () => {
  const [selectedValues, setSelectedValues] = useState(['option1']);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          With Individual Disabled Items
        </h3>
        <div className="flex flex-col gap-4">
          <CheckboxList
            values={selectedValues}
            onValuesChange={setSelectedValues}
          >
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option1" id="disabled-c1" />
              <label htmlFor="disabled-c1" className="cursor-pointer">
                Option 1 (Enabled)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option2" id="disabled-c2" disabled />
              <label
                htmlFor="disabled-c2"
                className="cursor-not-allowed text-gray-400"
              >
                Option 2 (Disabled)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <CheckboxListItem value="option3" id="disabled-c3" />
              <label htmlFor="disabled-c3" className="cursor-pointer">
                Option 3 (Enabled)
              </label>
            </div>
          </CheckboxList>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selected:</strong>{' '}
              {selectedValues.length > 0 ? selectedValues.join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * All combinations showcase
 */
/**
 * Multiple CheckboxList components on the same page to test isolation
 */
export const MultipleInstances: Story = () => {
  const [group1Values, setGroup1Values] = useState(['option1']);
  const [group2Values, setGroup2Values] = useState(['option4']);
  const [group3Values, setGroup3Values] = useState(['option7', 'option8']);

  return (
    <div className="flex flex-col gap-8 p-8">
      <h2 className="text-2xl font-bold text-text-950 mb-6">
        Multiple CheckboxList Instances - Testing Isolation
      </h2>

      {/* First CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Group 1 - Fruits
        </h3>
        <CheckboxList values={group1Values} onValuesChange={setGroup1Values}>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option1" id="fruit1" />
            <label htmlFor="fruit1" className="cursor-pointer">
              Apple
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option2" id="fruit2" />
            <label htmlFor="fruit2" className="cursor-pointer">
              Banana
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option3" id="fruit3" />
            <label htmlFor="fruit3" className="cursor-pointer">
              Orange
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Group 1 Selected:</strong>{' '}
            {group1Values.length > 0 ? group1Values.join(', ') : 'None'}
          </p>
        </div>
      </div>

      {/* Second CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Group 2 - Colors
        </h3>
        <CheckboxList values={group2Values} onValuesChange={setGroup2Values}>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option4" id="color1" />
            <label htmlFor="color1" className="cursor-pointer">
              Red
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option5" id="color2" />
            <label htmlFor="color2" className="cursor-pointer">
              Blue
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option6" id="color3" />
            <label htmlFor="color3" className="cursor-pointer">
              Green
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Group 2 Selected:</strong>{' '}
            {group2Values.length > 0 ? group2Values.join(', ') : 'None'}
          </p>
        </div>
      </div>

      {/* Third CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Group 3 - Numbers
        </h3>
        <CheckboxList values={group3Values} onValuesChange={setGroup3Values}>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option7" id="num1" />
            <label htmlFor="num1" className="cursor-pointer">
              One
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option8" id="num2" />
            <label htmlFor="num2" className="cursor-pointer">
              Two
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="option9" id="num3" />
            <label htmlFor="num3" className="cursor-pointer">
              Three
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Group 3 Selected:</strong>{' '}
            {group3Values.length > 0 ? group3Values.join(', ') : 'None'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="border border-border-200 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Summary - All Groups
        </h3>
        <div className="space-y-2">
          <p>
            <strong>Group 1 (Fruits):</strong>{' '}
            {group1Values.join(', ') || 'None'}
          </p>
          <p>
            <strong>Group 2 (Colors):</strong>{' '}
            {group2Values.join(', ') || 'None'}
          </p>
          <p>
            <strong>Group 3 (Numbers):</strong>{' '}
            {group3Values.join(', ') || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Multiple CheckboxList with different configurations to test isolation
 */
export const MultipleConfigurations: Story = () => {
  const [controlledValues, setControlledValues] = useState(['controlled1']);
  const [uncontrolledValues, setUncontrolledValues] = useState([
    'uncontrolled1',
  ]);
  const [disabledValues, setDisabledValues] = useState(['disabled1']);

  return (
    <div className="flex flex-col gap-8 p-8">
      <h2 className="text-2xl font-bold text-text-950 mb-6">
        Multiple CheckboxList Configurations - Advanced Isolation Test
      </h2>

      {/* Controlled CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Controlled CheckboxList
        </h3>
        <CheckboxList
          values={controlledValues}
          onValuesChange={setControlledValues}
        >
          <div className="flex items-center gap-3">
            <CheckboxListItem value="controlled1" id="controlled1" />
            <label htmlFor="controlled1" className="cursor-pointer">
              Controlled Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="controlled2" id="controlled2" />
            <label htmlFor="controlled2" className="cursor-pointer">
              Controlled Option 2
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Controlled Selected:</strong>{' '}
            {controlledValues.length > 0 ? controlledValues.join(', ') : 'None'}
          </p>
        </div>
      </div>

      {/* Uncontrolled CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Uncontrolled CheckboxList
        </h3>
        <CheckboxList
          defaultValues={['uncontrolled1']}
          onValuesChange={setUncontrolledValues}
        >
          <div className="flex items-center gap-3">
            <CheckboxListItem value="uncontrolled1" id="uncontrolled1" />
            <label htmlFor="uncontrolled1" className="cursor-pointer">
              Uncontrolled Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="uncontrolled2" id="uncontrolled2" />
            <label htmlFor="uncontrolled2" className="cursor-pointer">
              Uncontrolled Option 2
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Uncontrolled Selected:</strong>{' '}
            {uncontrolledValues.length > 0
              ? uncontrolledValues.join(', ')
              : 'None'}
          </p>
        </div>
      </div>

      {/* Disabled CheckboxList */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Disabled CheckboxList
        </h3>
        <CheckboxList
          values={disabledValues}
          onValuesChange={setDisabledValues}
          disabled={true}
        >
          <div className="flex items-center gap-3">
            <CheckboxListItem value="disabled1" id="disabled1" />
            <label htmlFor="disabled1" className="cursor-pointer">
              Disabled Option 1
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="disabled2" id="disabled2" />
            <label htmlFor="disabled2" className="cursor-pointer">
              Disabled Option 2
            </label>
          </div>
        </CheckboxList>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Disabled Selected:</strong>{' '}
            {disabledValues.length > 0 ? disabledValues.join(', ') : 'None'}
          </p>
        </div>
      </div>

      {/* Mixed CheckboxList with some disabled items */}
      <div className="border border-border-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Mixed CheckboxList (Some Disabled)
        </h3>
        <CheckboxList
          defaultValues={['mixed1']}
          onValuesChange={(values) =>
            console.log('Mixed values changed:', values)
          }
        >
          <div className="flex items-center gap-3">
            <CheckboxListItem value="mixed1" id="mixed1" />
            <label htmlFor="mixed1" className="cursor-pointer">
              Mixed Option 1 (Enabled)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="mixed2" id="mixed2" disabled />
            <label htmlFor="mixed2" className="cursor-pointer">
              Mixed Option 2 (Disabled)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <CheckboxListItem value="mixed3" id="mixed3" />
            <label htmlFor="mixed3" className="cursor-pointer">
              Mixed Option 3 (Enabled)
            </label>
          </div>
        </CheckboxList>
      </div>

      {/* Summary */}
      <div className="border border-border-200 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-text-950">
          Summary - All Configurations
        </h3>
        <div className="space-y-2">
          <p>
            <strong>Controlled:</strong> {controlledValues.join(', ') || 'None'}
          </p>
          <p>
            <strong>Uncontrolled:</strong>{' '}
            {uncontrolledValues.join(', ') || 'None'}
          </p>
          <p>
            <strong>Disabled:</strong> {disabledValues.join(', ') || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const AllCombinations: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        All Size and State Combinations
      </h3>
      <div className="grid grid-cols-2 gap-8">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-4">
            <h4 className="font-medium text-md text-text-950">
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </h4>
            {states.map((state) => (
              <div key={`${size}-${state}`} className="flex items-center gap-4">
                <CheckboxList>
                  <div className="flex items-center gap-3">
                    <CheckboxListItem
                      value={`${size}-${state}`}
                      id={`${size}-${state}`}
                      size={size}
                      state={state === 'disabled' ? 'default' : state}
                      disabled={state === 'disabled'}
                    />
                    <label
                      htmlFor={`${size}-${state}`}
                      className="cursor-pointer"
                    >
                      {state}
                    </label>
                  </div>
                </CheckboxList>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);
