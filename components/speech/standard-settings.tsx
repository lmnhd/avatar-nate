"use client";
import React, { useEffect, useState } from "react";

export default function StandardSpeechSettings({
  text,
  pitch,
  rate,
  volume,
  handlePitchChange,
  handleRateChange,
  handleVolumeChange,
}: {
  text: string;
  pitch: number;
  rate: number;
  volume: number;
  handlePitchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex pb-5 items-center justify-center">
      <div className="p-2">
        <p className="text-xl text-gray-500">Pitch:</p>
        <input
          type="range"
          title="pitch"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={handlePitchChange}
          className="accent-cyan-500"
        />
      </div>

      <div className="p-2">
        <p className="text-xl text-gray-500">Rate:</p>
        <input
          type="range"
          title="rate"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
          className="accent-cyan-500"
        />
      </div>

      <div className="p-2">
        <p className="text-xl text-gray-500">Volume:</p>
        <input
          type="range"
          title="volume"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="accent-cyan-500"
        />
      </div>
    </div>
  );
}
