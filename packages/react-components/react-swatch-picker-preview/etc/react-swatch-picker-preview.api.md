## API Report File for "@fluentui/react-swatch-picker-preview"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { ComponentProps } from '@fluentui/react-utilities';
import type { ComponentState } from '@fluentui/react-utilities';
import type { ForwardRefComponent } from '@fluentui/react-utilities';
import * as React_2 from 'react';
import type { Slot } from '@fluentui/react-utilities';
import type { SlotClassNames } from '@fluentui/react-utilities';

// @public
export const renderSwatchPicker_unstable: (state: SwatchPickerState) => JSX.Element;

// @public
export const SwatchPicker: ForwardRefComponent<SwatchPickerProps>;

// @public (undocumented)
export const swatchPickerClassNames: SlotClassNames<SwatchPickerSlots>;

// @public
export type SwatchPickerProps = ComponentProps<SwatchPickerSlots> & {};

// @public (undocumented)
export type SwatchPickerSlots = {
    root: Slot<'div'>;
};

// @public
export type SwatchPickerState = ComponentState<SwatchPickerSlots>;

// @public
export const useSwatchPicker_unstable: (props: SwatchPickerProps, ref: React_2.Ref<HTMLDivElement>) => SwatchPickerState;

// @public
export const useSwatchPickerStyles_unstable: (state: SwatchPickerState) => SwatchPickerState;

// (No @packageDocumentation comment for this package)

```