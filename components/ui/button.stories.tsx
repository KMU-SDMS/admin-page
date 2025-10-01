import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Plus, Download, Trash2 } from "lucide-react";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "버튼의 시각적 스타일",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "버튼의 크기",
    },
    disabled: {
      control: "boolean",
      description: "버튼 비활성화 여부",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: "버튼",
  },
};

// 모든 Variant 예시
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// 모든 크기
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// 아이콘 포함
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Plus />
        추가하기
      </Button>
      <Button variant="outline">
        <Download />
        다운로드
      </Button>
      <Button variant="destructive">
        <Trash2 />
        삭제하기
      </Button>
    </div>
  ),
};

// 아이콘만
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="icon" variant="default">
        <Plus />
      </Button>
      <Button size="icon" variant="outline">
        <Download />
      </Button>
      <Button size="icon" variant="destructive">
        <Trash2 />
      </Button>
    </div>
  ),
};

// 비활성화 상태
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Default</Button>
      <Button disabled variant="destructive">
        Destructive
      </Button>
      <Button disabled variant="outline">
        Outline
      </Button>
    </div>
  ),
};

// 로딩 상태 (커스텀)
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        로딩 중...
      </Button>
      <Button variant="outline" disabled>
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        처리 중...
      </Button>
    </div>
  ),
};

// 풀 너비
export const FullWidth: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Button className="w-full">전체 너비 버튼</Button>
      <Button className="w-full" variant="outline">
        전체 너비 Outline
      </Button>
    </div>
  ),
};
