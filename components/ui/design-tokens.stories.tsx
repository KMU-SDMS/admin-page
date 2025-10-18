import type { Meta, StoryObj } from "@storybook/react";
import { designTokens } from "@/lib/design-tokens";

const meta = {
  title: "Design System/Design Tokens",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "디자인 시스템의 색상 토큰들을 시각화합니다.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// 색상 팔레트 컴포넌트
function ColorPalette({
  title,
  colors,
}: {
  title: string;
  colors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-headline-1 font-bold">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(colors).map(([name, value]) => (
          <div key={name} className="space-y-2">
            <div
              className="h-16 w-full rounded-md border border-border"
              style={{ backgroundColor: value }}
            />
            <div className="space-y-1">
              <p className="text-label-2 font-medium">{name}</p>
              <p className="text-caption-1 text-muted-foreground font-mono">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 의미론적 색상 컴포넌트
function SemanticColorPalette({
  title,
  colors,
}: {
  title: string;
  colors: Record<string, any>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-headline-1 font-bold">{title}</h3>
      <div className="space-y-6">
        {Object.entries(colors).map(([category, subcategory]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-body-1 font-bold capitalize">{category}</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {typeof subcategory === "object" &&
              !Array.isArray(subcategory) ? (
                Object.entries(subcategory).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div
                      className="h-12 w-full rounded-md border border-border flex items-center justify-center"
                      style={{
                        backgroundColor:
                          typeof value === "string" ? value : "#transparent",
                      }}
                    >
                      <span className="text-label-2 font-medium">
                        {typeof value === "string" ? "" : "Nested"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-label-2 font-medium">{key}</p>
                      <p className="text-caption-1 text-muted-foreground font-mono">
                        {typeof value === "string" ? value : "Object"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div
                    className="h-12 w-full rounded-md border border-border"
                    style={{
                      backgroundColor:
                        typeof subcategory === "string"
                          ? subcategory
                          : "#transparent",
                    }}
                  />
                  <div className="space-y-1">
                    <p className="text-label-2 font-medium">{category}</p>
                    <p className="text-caption-1 text-muted-foreground font-mono">
                      {typeof subcategory === "string" ? subcategory : "Object"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AtomicColors: Story = {
  render: () => (
    <div className="space-y-8">
      <ColorPalette title="Blue" colors={designTokens.atomic.blue} />
      <ColorPalette title="Green" colors={designTokens.atomic.green} />
      <ColorPalette title="Neutral" colors={designTokens.atomic.neutral} />
      <ColorPalette title="Orange" colors={designTokens.atomic.orange} />
      <ColorPalette title="Purple" colors={designTokens.atomic.purple} />
      <ColorPalette title="Red" colors={designTokens.atomic.red} />
      <ColorPalette
        title="Warm Neutral"
        colors={designTokens.atomic.warmneutral}
      />
      <ColorPalette title="Common" colors={designTokens.atomic.common} />
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-8">
      <SemanticColorPalette
        title="Semantic Colors"
        colors={designTokens.semantic}
      />
    </div>
  ),
};

export const ColorUsage: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Primary Colors</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="h-16 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground text-body-1 font-bold">
                Primary
              </span>
            </div>
            <p className="text-label-2">Primary</p>
            <p className="text-caption-1 text-muted-foreground">#374a95</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-primary-strong rounded-md flex items-center justify-center">
              <span className="text-primary-foreground text-body-1 font-bold">
                Strong
              </span>
            </div>
            <p className="text-label-2">Primary Strong</p>
            <p className="text-caption-1 text-muted-foreground">#304082</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-primary-heavy rounded-md flex items-center justify-center">
              <span className="text-primary-foreground text-body-1 font-bold">
                Heavy
              </span>
            </div>
            <p className="text-label-2">Primary Heavy</p>
            <p className="text-caption-1 text-muted-foreground">#293770</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Status Colors</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="h-16 bg-success rounded-md flex items-center justify-center">
              <span className="text-success-foreground text-body-1 font-bold">
                Success
              </span>
            </div>
            <p className="text-label-2">Success</p>
            <p className="text-caption-1 text-muted-foreground">#00bf40</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-warning rounded-md flex items-center justify-center">
              <span className="text-warning-foreground text-body-1 font-bold">
                Warning
              </span>
            </div>
            <p className="text-label-2">Warning</p>
            <p className="text-caption-1 text-muted-foreground">#ff9200</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-destructive rounded-md flex items-center justify-center">
              <span className="text-destructive-foreground text-body-1 font-bold">
                Error
              </span>
            </div>
            <p className="text-label-2">Destructive</p>
            <p className="text-caption-1 text-muted-foreground">#ff4242</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Background Colors</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-16 bg-background border border-border rounded-md flex items-center justify-center">
              <span className="text-foreground text-body-1 font-bold">
                Background
              </span>
            </div>
            <p className="text-label-2">Background</p>
            <p className="text-caption-1 text-muted-foreground">#ffffff</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded-md flex items-center justify-center">
              <span className="text-muted-foreground text-body-1 font-bold">
                Muted
              </span>
            </div>
            <p className="text-label-2">Muted</p>
            <p className="text-caption-1 text-muted-foreground">#67678b14</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
