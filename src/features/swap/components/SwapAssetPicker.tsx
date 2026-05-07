import { SelectDrawer } from '@/components/ui';
import { ASSET_IDS, ASSET_METADATA } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';

type SwapAssetPickerProps = {
  label: string;
  value: AssetId;
  onChange: (value: AssetId) => void;
  exclude?: AssetId;
};

const ASSET_OPTIONS = ASSET_IDS.map((id) => ({
  value: id,
  label: `${ASSET_METADATA[id].name} (${ASSET_METADATA[id].symbol})`,
}));

export function SwapAssetPicker({ label, value, onChange, exclude }: SwapAssetPickerProps) {
  const options = exclude ? ASSET_OPTIONS.filter((o) => o.value !== exclude) : ASSET_OPTIONS;

  return (
    <SelectDrawer
      value={value}
      onValueChange={(v) => onChange(v as AssetId)}
      options={options}
      title={label}
      placeholder={label}
    />
  );
}
