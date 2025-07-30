
"use client";

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from './slider';
import { Label } from './label';
import tinycolor from 'tinycolor2';

const colorPalette = [
  '#FF0000', '#0000FF', '#008000', '#FFFF00', '#FFA500', '#800080', 
  '#000000', '#FFFFFF', '#808080', '#A52A2A', '#FFC0CB', '#00FFFF'
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const initialColor = tinycolor(value);
    const [baseColor, setBaseColor] = useState(initialColor.toHexString());
    const [lightness, setLightness] = useState(initialColor.getLuminance() * 100);

    const handleBaseColorChange = (color: string) => {
        setBaseColor(color);
        const newColor = tinycolor(color).lighten(lightness - 50).toHexString();
        onChange(newColor);
    };

    const handleLightnessChange = (newLightness: number) => {
        setLightness(newLightness);
        const newColor = tinycolor(baseColor).lighten(newLightness - 50).toHexString();
        onChange(newColor);
    };

    const displayColor = useMemo(() => tinycolor(baseColor).lighten(lightness - 50).toHexString(), [baseColor, lightness]);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
                {colorPalette.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => handleBaseColorChange(color)}
                        className={cn(
                            "w-full aspect-square rounded-md border",
                            baseColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                        )}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="lightness-slider" className="text-xs">Lightness</Label>
                    <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: displayColor }} />
                         <span className="text-xs font-mono">{displayColor}</span>
                    </div>
                 </div>
                <Slider
                    id="lightness-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[lightness]}
                    onValueChange={([val]) => handleLightnessChange(val)}
                />
            </div>
        </div>
    );
}

