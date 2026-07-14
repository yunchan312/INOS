import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { createTransport, type Transporter } from 'nodemailer';
import {
  MembershipInvite,
  type MembershipInviteProps,
} from './templates/membership-invite';
import {
  MeetingInvite,
  type MeetingInviteProps,
} from './templates/meeting-invite';
import { NoCommonDate } from './templates/no-common-date';
import { OrgCreated } from './templates/org-created';
import { SimpleNotice } from './templates/simple-notice';

export interface SendMembershipInviteInput {
  toEmail: string;
  groupName: string;
  inviterName: string;
  greeting?: string | null;
  acceptUrl: string;
}

export interface SendMeetingInviteInput {
  toEmail: string;
  toName: string;
  groupName: string;
  greeting?: string | null;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  movieTitle?: string | null;
  movieDirector?: string | null;
  candidateFrom: Date;
  candidateTo: Date;
  availabilityUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    this.from = this.config.get<string>(
      'MAIL_FROM',
      smtpUser ? `INOS <${smtpUser}>` : 'INOS <no-reply@inos.app>',
    );

    if (smtpUser && smtpPass) {
      // env 값은 문자열로 들어오므로 숫자로 강제 변환 (secure 판정에 필요)
      const port = Number(this.config.get<string>('SMTP_PORT', '465'));
      this.transporter = createTransport({
        host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP_USER/SMTP_PASS 미설정 — 이메일이 실제 발송되지 않고 콘솔에 기록됨',
      );
    }
  }

  async sendMembershipInvite(input: SendMembershipInviteInput): Promise<void> {
    const props: MembershipInviteProps = {
      groupName: input.groupName,
      inviterName: input.inviterName,
      inviteeEmail: input.toEmail,
      acceptUrl: input.acceptUrl,
      greeting: input.greeting ?? null,
    };
    const html = await render(MembershipInvite(props));
    const subject = `${input.inviterName}님이 「${input.groupName}」에 초대했어요`;
    await this.send(input.toEmail, subject, html);
  }

  async sendNoCommonDate(input: {
    toEmail: string;
    toName: string;
    groupName: string;
    orgUrl: string;
    meetingId: string;
  }): Promise<void> {
    const subject = `[INOS] 「${input.groupName}」 모임 날짜를 직접 정해주세요`;
    const html = await render(
      NoCommonDate({
        toName: input.toName,
        groupName: input.groupName,
        orgUrl: input.orgUrl,
      }),
    );
    await this.send(input.toEmail, subject, html);
  }

  async sendOrgCreated(input: {
    toEmail: string;
    toName: string;
    orgName: string;
    orgUrl: string;
  }): Promise<void> {
    const subject = `[INOS] 「${input.orgName}」 오가니제이션이 생성됐어요`;
    const html = await render(
      OrgCreated({
        toName: input.toName,
        orgName: input.orgName,
        orgUrl: input.orgUrl,
      }),
    );
    await this.send(input.toEmail, subject, html);
  }

  async sendOrgUpdated(input: {
    toEmail: string;
    toName: string;
    orgName: string;
    orgUrl: string;
    changes: string[];
  }): Promise<void> {
    const subject = `[INOS] 「${input.orgName}」 오가니제이션 정보가 변경됐어요`;
    const html = await render(
      SimpleNotice({
        preview: subject,
        headerLabel: input.orgName,
        label: '변경 알림',
        title: '오가니제이션 정보가 변경됐어요',
        lines: [
          `${input.toName}님, 관리자가 「${input.orgName}」 오가니제이션 정보를 변경했어요.`,
        ],
        listItems: input.changes,
        ctaText: '오가니제이션 바로가기',
        ctaUrl: input.orgUrl,
      }),
    );
    await this.send(input.toEmail, subject, html);
  }

  async sendOrgDeleted(input: {
    toEmail: string;
    toName: string;
    orgName: string;
  }): Promise<void> {
    const subject = `[INOS] 「${input.orgName}」 오가니제이션이 삭제됐어요`;
    const html = await render(
      SimpleNotice({
        preview: subject,
        headerLabel: input.orgName,
        label: '삭제 알림',
        title: '오가니제이션이 삭제됐어요',
        lines: [
          `${input.toName}님, 관리자가 「${input.orgName}」 오가니제이션을 삭제했어요.`,
          '모임 기록과 발제문도 함께 삭제됐어요. 문의사항이 있다면 이 메일에 회신해주세요.',
        ],
      }),
    );
    await this.send(input.toEmail, subject, html);
  }

  async sendOrgRequest(fromEmail: string, message?: string): Promise<void> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'yunchan0339@gmail.com');
    const subject = '[INOS] 오가니제이션 생성 신청';
    const html = `
      <p><strong>신청자 이메일:</strong> ${fromEmail}</p>
      ${message ? `<p><strong>추가 내용:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
    `;
    await this.send(adminEmail, subject, html);
  }

  async sendMeetingInvite(input: SendMeetingInviteInput): Promise<void> {
    const props: MeetingInviteProps = {
      toName: input.toName,
      groupName: input.groupName,
      greeting: input.greeting ?? null,
      bookTitle: input.bookTitle ?? null,
      bookAuthor: input.bookAuthor ?? null,
      movieTitle: input.movieTitle ?? null,
      movieDirector: input.movieDirector ?? null,
      candidateFrom: input.candidateFrom,
      candidateTo: input.candidateTo,
      availabilityUrl: input.availabilityUrl,
    };
    const html = await render(MeetingInvite(props));
    const subject = `「${input.groupName}」의 다음 모임 — 가능한 날짜를 선택해주세요`;
    await this.send(input.toEmail, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[DEV EMAIL] to=${to} subject="${subject}"\n${html.slice(0, 500)}…`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`이메일 발송 실패: ${message}`);
      throw new Error(`이메일 발송 실패: ${message}`);
    }
    this.logger.log(`Email sent → ${to} : ${subject}`);
  }
}
