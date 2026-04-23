/**
 * Entidad hija: NotificationSettings (parte del aggregate Organization)
 */
import { Email } from '../../../../shared/domain/value-objects/Email.vo';

export interface NotificationSettingsProps {
  emailFromName: string | null;
  emailReplyTo: Email | null;
  enableEmail: boolean;
  smsEnabled: boolean;
}

export class NotificationSettings {
  private constructor(private props: NotificationSettingsProps) {}

  static create(props: {
    emailFromName?: string | null;
    emailReplyTo?: string | null;
    enableEmail?: boolean;
    smsEnabled?: boolean;
  }): NotificationSettings {
    return new NotificationSettings({
      emailFromName: props.emailFromName?.trim() || null,
      emailReplyTo: props.emailReplyTo ? Email.create(props.emailReplyTo) : null,
      enableEmail: props.enableEmail ?? true,
      smsEnabled: props.smsEnabled ?? false,
    });
  }

  static default(): NotificationSettings {
    return NotificationSettings.create({});
  }

  get emailFromName(): string | null { return this.props.emailFromName; }
  get emailReplyTo(): Email | null { return this.props.emailReplyTo; }
  get enableEmail(): boolean { return this.props.enableEmail; }
  get smsEnabled(): boolean { return this.props.smsEnabled; }

  replaceAll(props: Partial<{
    emailFromName: string | null;
    emailReplyTo: string | null;
    enableEmail: boolean;
    smsEnabled: boolean;
  }>): void {
    if (props.emailFromName !== undefined) this.props.emailFromName = props.emailFromName?.trim() || null;
    if (props.emailReplyTo !== undefined) this.props.emailReplyTo = props.emailReplyTo ? Email.create(props.emailReplyTo) : null;
    if (props.enableEmail !== undefined) this.props.enableEmail = props.enableEmail;
    if (props.smsEnabled !== undefined) this.props.smsEnabled = props.smsEnabled;
  }
}
