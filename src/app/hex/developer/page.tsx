'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import { CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory';
import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums';
import type { IngredientBase, Item } from '@/app/hex/architecture/typings';
import './developer.css';

const ELEMENT_COLORS: Record<ALCH_ELEMENT, string> = {
  [ALCH_ELEMENT.FIRE]:   '#e05a2b',
  [ALCH_ELEMENT.WATER]:  '#3b82f6',
  [ALCH_ELEMENT.EARTH]:  '#65a30d',
  [ALCH_ELEMENT.WIND]:   '#a78bfa',
  [ALCH_ELEMENT.AETHER]: '#f59e0b',
  [ALCH_ELEMENT.CHAOS]:  '#ec4899',
};

type SlotEntry = { shape: string; pct: number; count: number };

function runSimulation(ingBase: IngredientBase, tool: Item | undefined, amount: number): SlotEntry[][] {
  const slotCounts: Record<string, number>[] = ingBase.possibleComps.map(() => ({}));

  for (let i = 0; i < amount; i++) {
    const ing = CreateIngredient(ingBase, tool);
    ingBase.possibleComps.forEach((_, slotIndex) => {
      const comp = ing.comps.find(c => c.ingredientIndex === slotIndex);
      const key = comp ? (comp.shape as string) : 'None';
      slotCounts[slotIndex][key] = (slotCounts[slotIndex][key] ?? 0) + 1;
    });
  }

  return slotCounts.map(counts =>
    Object.entries(counts)
      .map(([shape, count]) => ({
        shape,
        count,
        pct: parseFloat(((count / amount) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count),
  );
}

function slotLabel(ingBase: IngredientBase, index: number): string {
  const spec = ingBase.possibleComps[index];
  const chance = 'possibleShapes' in spec && spec.chance !== undefined ? spec.chance : 1;
  const chanceStr = chance < 1 ? ` · ${Math.round(chance * 100)}% chance` : '';
  return `Slot ${index + 1} · ${spec.element}${chanceStr}`;
}

function slotElement(ingBase: IngredientBase, index: number): ALCH_ELEMENT {
  return ingBase.possibleComps[index].element;
}

export default function DeveloperPage() {
  const craftedItems = useAppSelector(state => state.Player.inventory.crafted);

  const gatherTools = useMemo(
    () => craftedItems.filter(item => item.types.includes(ITEM_TAG.GATHER_TOOL)),
    [craftedItems],
  );

  const ingredientList = useMemo(() => Object.values(IngredientBases), []);

  const [selectedIngId, setSelectedIngId] = useState('');
  const [selectedToolId, setSelectedToolId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [activeTab, setActiveTab] = useState(0);

  const selectedIngBase = selectedIngId ? IngredientBases[selectedIngId] : null;
  const selectedTool = selectedToolId
    ? craftedItems.find(i => i.id === selectedToolId)
    : undefined;

  const results = useMemo(() => {
    if (!selectedIngBase) return null;
    return runSimulation(selectedIngBase, selectedTool, amount);
  }, [selectedIngBase, selectedTool, amount]);

  const safeTab = results && activeTab < results.length ? activeTab : 0;
  const activeElement = selectedIngBase ? slotElement(selectedIngBase, safeTab) : null;
  const barColor = activeElement ? ELEMENT_COLORS[activeElement] : '#6366f1';

  function handleIngredientChange(id: string) {
    setSelectedIngId(id);
    setActiveTab(0);
  }

  return (
    <div className="dev-page">
      <h1 className="dev-heading">Developer Controls</h1>

      <div className="dev-chart-area">
        {results ? (
          <>
            <div className="dev-tabs">
              {results.map((_, i) => (
                <button
                  key={i}
                  className={`dev-tab${safeTab === i ? ' dev-tab--active' : ''}`}
                  onClick={() => setActiveTab(i)}
                  style={safeTab === i ? { borderBottomColor: ELEMENT_COLORS[slotElement(selectedIngBase!, i)] } : {}}
                >
                  {slotLabel(selectedIngBase!, i)}
                </button>
              ))}
            </div>

            <div className="dev-chart">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={results[safeTab]} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
                  <XAxis
                    dataKey="shape"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `${v}%`}
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0' }}
                    formatter={(value, _, entry) => [
                      `${value}%  (${(entry as { payload?: SlotEntry }).payload?.count ?? 0} / ${amount})`,
                      'Frequency',
                    ]}
                  />
                  <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                    {results[safeTab].map((entry, i) => (
                      <Cell key={i} fill={entry.shape === 'None' ? '#475569' : barColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="dev-chart-empty">
            Select an ingredient to generate the shape distribution.
          </div>
        )}
      </div>

      <div className="dev-controls">
        <div className="dev-control-group">
          <label className="dev-label" htmlFor="dev-amount">Amount</label>
          <input
            id="dev-amount"
            type="number"
            min={1}
            max={10000}
            value={amount}
            onChange={e => setAmount(Math.max(1, Math.min(10000, parseInt(e.target.value, 10) || 1)))}
            className="dev-input"
          />
        </div>

        <div className="dev-control-group">
          <label className="dev-label" htmlFor="dev-ingredient">Ingredient</label>
          <select
            id="dev-ingredient"
            value={selectedIngId}
            onChange={e => handleIngredientChange(e.target.value)}
            className="dev-select"
          >
            <option value="">— select ingredient —</option>
            {ingredientList.map(ing => (
              <option key={ing.id} value={ing.id}>{ing.name}</option>
            ))}
          </select>
        </div>

        <div className="dev-control-group">
          <label className="dev-label" htmlFor="dev-tool">Equipment</label>
          <select
            id="dev-tool"
            value={selectedToolId}
            onChange={e => setSelectedToolId(e.target.value)}
            className="dev-select"
          >
            <option value="">Hand (no tool)</option>
            {gatherTools.length === 0 && (
              <option disabled>— no gather tools in inventory —</option>
            )}
            {gatherTools.map(tool => (
              <option key={tool.id} value={tool.id}>{tool.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
