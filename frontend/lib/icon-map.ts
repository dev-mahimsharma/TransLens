import {
  Sparkles, MessageSquare, Scissors, Orbit, ArrowLeftRight, Network, Layers,
  BarChart3, Dices, Target, Workflow, Brain, TrendingUp, CircuitBoard,
  MessageCircle, Info, Lightbulb, AlertTriangle, CheckCircle2, BookOpen,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, MessageSquare, Scissors, Orbit, ArrowLeftRight, Network, Layers,
  BarChart3, Dices, Target, Workflow, Brain, TrendingUp, CircuitBoard,
  MessageCircle, Info, Lightbulb, AlertTriangle, CheckCircle2, BookOpen,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}