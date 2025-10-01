import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card";
import { Button } from "./button";
import { Bell, Settings, User } from "lucide-react";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 카드
export const Default: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명이 들어가는 영역입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">카드 내용이 들어가는 영역입니다.</p>
      </CardContent>
    </Card>
  ),
};

// 완전한 카드 (모든 섹션 포함)
export const Complete: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>알림을 받을 방법을 선택하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            새로운 메시지, 업데이트 및 중요한 알림을 받아볼 수 있습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            언제든지 설정을 변경할 수 있습니다.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </CardFooter>
    </Card>
  ),
};

// 액션 버튼이 있는 카드
export const WithAction: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>프로필 설정</CardTitle>
        <CardDescription>개인정보를 관리하세요</CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost">
            <Settings />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <User />
          </div>
          <div>
            <p className="font-medium">홍길동</p>
            <p className="text-sm text-muted-foreground">hong@example.com</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

// 여러 카드 그리드
export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="text-primary" />
          </div>
          <CardTitle>알림</CardTitle>
          <CardDescription>새로운 알림 3개</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">3</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <User />
          </div>
          <CardTitle>사용자</CardTitle>
          <CardDescription>활성 사용자 수</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">1,234</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
            <Settings />
          </div>
          <CardTitle>설정</CardTitle>
          <CardDescription>시스템 설정</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">설정을 관리하세요</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// 긴 내용의 카드
export const LongContent: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>서비스 약관</CardTitle>
        <CardDescription>마지막 업데이트: 2025년 10월 1일</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <p>
            본 약관은 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
          <p>
            회사는 본 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해
            공지됩니다. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을
            중단할 수 있습니다.
          </p>
          <p className="text-muted-foreground">
            자세한 내용은 고객센터로 문의해주세요.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">동의하고 계속하기</Button>
      </CardFooter>
    </Card>
  ),
};

// 심플한 카드 (헤더만)
export const Simple: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-2xl font-bold">99%</p>
          <p className="text-sm text-muted-foreground">시스템 가동률</p>
        </div>
      </CardContent>
    </Card>
  ),
};
