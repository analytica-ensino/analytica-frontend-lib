import type { Story } from '@ladle/react';
import { Alert } from './Alert';

/**
 * Showcase principal: todas as combinações possíveis do Alert
 */
export const AllAlerts: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Alert</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Alert</code>
    </p>

    {/* Alertas com variante sólida */}
    <h3 className="font-bold text-2xl text-text-900">Variante Sólida</h3>
    <div className="flex flex-col gap-4">
      <Alert
        variant="solid"
        action="default"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="info"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="success"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="warning"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="error"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>

    {/* Alertas sólidos sem título */}
    <h3 className="font-bold text-2xl text-text-900">Sólido sem título</h3>
    <div className="flex flex-col gap-4">
      <Alert
        variant="solid"
        action="default"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="info"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="success"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="warning"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="error"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>

    {/* Alertas com variante outline */}
    <h3 className="font-bold text-2xl text-text-900">Variante Outline</h3>
    <div className="flex flex-col gap-4">
      <Alert
        variant="outline"
        action="default"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="info"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="success"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="warning"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="error"
        title="Thank you for choosing Edo Delivery"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>

    {/* Alertas com variante outline sem título */}
    <h3 className="font-bold text-2xl text-text-900">Outline sem título</h3>
    <div className="flex flex-col gap-4">
      <Alert
        variant="outline"
        action="default"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="info"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="success"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="warning"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="error"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>
  </div>
);

export const SolidWithHeading: Story = () => (
    <div className="flex flex-col gap-4">
        <Alert
            variant="solid"
            action="default"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="solid"
            action="info"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="solid"
            action="success"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="solid"
            action="warning"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="solid"
            action="error"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
    </div>
);

export const SolidWithoutHeading: Story = () => (
    <div className="flex flex-col gap-4">
      <Alert
        variant="solid"
        action="default"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="info"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="success"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="warning"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="solid"
        action="error"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>
);

export const OutlineWithHeading: Story = () => (
    <div className="flex flex-col gap-4">
        <Alert
            variant="outline"
            action="default"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="outline"
            action="info"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="outline"
            action="success"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="outline"
            action="warning"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
        <Alert
            variant="outline"
            action="error"
            title="Thank you for choosing Edo Delivery"
            description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
        />
    </div>
);

export const OutlineWithoutHeading: Story = () => (
    <div className="flex flex-col gap-4">
      <Alert
        variant="outline"
        action="default"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="info"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="success"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="warning"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
      <Alert
        variant="outline"
        action="error"
        description="Delivery of this parcel generated 93.2% less carbon dioxide in the last mile than our home delivery."
      />
    </div>
); 