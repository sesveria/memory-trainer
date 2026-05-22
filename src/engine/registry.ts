import type { ModeId, ModeCategory, ModeMeta, TrainingEngine } from '../types';

interface RegistryEntry {
  meta: ModeMeta;
  engine: TrainingEngine;
}

const registry = new Map<ModeId, RegistryEntry>();

export function registerMode(meta: ModeMeta, engine: TrainingEngine): void {
  if (registry.has(meta.id)) {
    throw new Error(`Mode "${meta.id}" is already registered`);
  }
  registry.set(meta.id, { meta, engine });
}

export function getModeMeta(id: ModeId): ModeMeta {
  const entry = registry.get(id);
  if (!entry) throw new Error(`Unknown mode: ${id}`);
  return { ...entry.meta };
}

export function getEngine(id: ModeId): TrainingEngine {
  const entry = registry.get(id);
  if (!entry) throw new Error(`Unknown mode: ${id}`);
  return entry.engine;
}

export function getAllModes(): ModeMeta[] {
  return Array.from(registry.values()).map((e) => ({ ...e.meta }));
}

export function getModesByCategory(category: ModeCategory): ModeMeta[] {
  return getAllModes().filter((m) => m.category === category);
}

export function getMinSpan(id: ModeId): number {
  return getModeMeta(id).minSpan;
}

export function getMaxSpan(id: ModeId): number {
  return getModeMeta(id).maxSpan;
}
