import type { Meta, StoryObj } from "@storybook/react";
import {
  Typography,
  Display1,
  Display2,
  Title1,
  Title2,
  Title3,
  Heading1,
  Heading2,
  Headline1,
  Headline2,
  Body1,
  Body1Reading,
  Body2,
  Body2Reading,
  Label1,
  Label2,
  Caption1,
  Caption2,
} from "./typography";

const meta = {
  title: "Design System/Typography",
  component: Typography,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "디자인 시스템 기반 타이포그래피 컴포넌트들입니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: [
        "display-1",
        "display-2",
        "title-1",
        "title-2",
        "title-3",
        "heading-1",
        "heading-2",
        "headline-1",
        "headline-2",
        "body-1",
        "body-1-reading",
        "body-2",
        "body-2-reading",
        "label-1",
        "label-2",
        "caption-1",
        "caption-2",
      ],
      description: "타이포그래피 레벨",
    },
    weight: {
      control: "select",
      options: ["regular", "medium", "bold"],
      description: "폰트 가중치",
    },
    color: {
      control: "select",
      options: [
        "normal",
        "muted",
        "secondary",
        "strong",
        "disable",
        "primary",
        "secondary",
        "success",
        "warning",
        "destructive",
        "inherit",
      ],
      description: "텍스트 색상",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"],
      description: "HTML 태그",
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "기본 타이포그래피 텍스트",
    level: "body-1",
    weight: "regular",
    color: "normal",
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Display</h3>
        <Display1>Display 1 - 가장 큰 크기</Display1>
        <Display2>Display 2 - 그 다음 큰 크기</Display2>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Title</h3>
        <Title1>Title 1 - 큰 크기</Title1>
        <Title2>Title 2 - 중간 크기</Title2>
        <Title3>Title 3 - 작은 크기</Title3>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Heading</h3>
        <Heading1>Heading 1 - 큰 화면용</Heading1>
        <Heading2>Heading 2 - 작은 화면용</Heading2>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Headline</h3>
        <Headline1>Headline 1 - 큰 화면용 강조</Headline1>
        <Headline2>Headline 2 - 작은 화면용 강조</Headline2>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Body</h3>
        <Body1>Body 1 - 일반적인 본문 텍스트</Body1>
        <Body1Reading>Body 1 Reading - 읽기용 본문 텍스트</Body1Reading>
        <Body2>Body 2 - 대체적인 본문 텍스트</Body2>
        <Body2Reading>Body 2 Reading - 읽기용 대체 본문 텍스트</Body2Reading>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Label</h3>
        <Label1>Label 1 - 참고 내용 표시</Label1>
        <Label2>Label 2 - 낮은 위계의 참고 내용</Label2>
      </div>

      <div className="space-y-4">
        <h3 className="text-headline-1 font-bold">Caption</h3>
        <Caption1>Caption 1 - 부가적인 내용</Caption1>
        <Caption2>Caption 2 - 가장 낮은 위계의 부가 내용</Caption2>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography level="title-1" weight="regular">
        Regular Weight (400)
      </Typography>
      <Typography level="title-1" weight="medium">
        Medium Weight (500)
      </Typography>
      <Typography level="title-1" weight="bold">
        Bold Weight (700)
      </Typography>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography level="body-1" color="normal">
        Normal Color - 기본 텍스트 색상
      </Typography>
      <Typography level="body-1" color="muted">
        Muted Color - 흐린 텍스트 색상
      </Typography>
      <Typography level="body-1" color="secondary">
        Secondary Color - 보조 텍스트 색상
      </Typography>
      <Typography level="body-1" color="strong">
        Strong Color - 강조된 텍스트 색상
      </Typography>
      <Typography level="body-1" color="primary">
        Primary Color - 주요 색상
      </Typography>
      <Typography level="body-1" color="success">
        Success Color - 성공 상태 색상
      </Typography>
      <Typography level="body-1" color="warning">
        Warning Color - 경고 상태 색상
      </Typography>
      <Typography level="body-1" color="destructive">
        Destructive Color - 위험 상태 색상
      </Typography>
    </div>
  ),
};

export const SemanticUsage: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Title1>기숙사 관리 시스템</Title1>
        <Body1 color="muted">
          학생들의 생활을 효율적으로 관리하는 통합 시스템입니다.
        </Body1>
      </div>

      <div className="space-y-4">
        <Heading1>주요 기능</Heading1>
        <div className="space-y-2">
          <Headline2>공지 시스템</Headline2>
          <Body2>중요한 공지사항을 학생들에게 전달합니다.</Body2>
        </div>
        <div className="space-y-2">
          <Headline2>관리비 관리</Headline2>
          <Body2>전기, 수도, 가스 사용량을 체계적으로 관리합니다.</Body2>
        </div>
      </div>

      <div className="space-y-2">
        <Label1 color="secondary">마지막 업데이트: 2024년 1월 15일</Label1>
        <Caption1 color="muted">
          © 2024 기숙사 관리 시스템. 모든 권리 보유.
        </Caption1>
      </div>
    </div>
  ),
};
