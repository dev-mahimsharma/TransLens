import type { ComponentType } from 'react';
import { AIFamilyTree } from './AIFamilyTree';
import { PipelineDiagram } from './PipelineDiagram';
import { TokenizerPlayground } from './TokenizerPlayground';
import { SpecialTokensDiagram } from './SpecialTokensDiagram';
import { PromptAnatomyDiagram } from './PromptAnatomyDiagram';
import { EmbeddingSpaceDiagram } from './EmbeddingSpaceDiagram';
import { PositionalEncodingWave } from './PositionalEncodingWave';
import { QKVDiagram } from './QKVDiagram';
import { ScaledDotProductDiagram } from './ScaledDotProductDiagram';
import { MultiHeadAttentionDiagram } from './MultiHeadAttentionDiagram';
import { CausalMaskDiagram } from './CausalMaskDiagram';
import { AttentionHeatmap } from './AttentionHeatmap';
import { TransformerArchitectureDiagram } from './TransformerArchitectureDiagram';
import { FFNDiagram } from './FFNDiagram';
import { LogitsBarChart } from './LogitsBarChart';
import { SamplingPlayground } from './SamplingPlayground';
import { AutoregressiveLoopDiagram } from './AutoregressiveLoopDiagram';

/**
 * Add new diagrams/interactives here as you author them, keyed by the
 * `component` string used in lib/chapters/*.ts data files.
 */
export const DIAGRAM_REGISTRY: Record<string, ComponentType<any>> = {
  AIFamilyTree,
  PipelineDiagram,
  TokenizerPlayground,
  SpecialTokensDiagram,
  PromptAnatomyDiagram,
  EmbeddingSpaceDiagram,
  PositionalEncodingWave,
  QKVDiagram,
  ScaledDotProductDiagram,
  MultiHeadAttentionDiagram,
  CausalMaskDiagram,
  AttentionHeatmap,
  TransformerArchitectureDiagram,
  FFNDiagram,
  LogitsBarChart,
  SamplingPlayground,
  AutoregressiveLoopDiagram,
};