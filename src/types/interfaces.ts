export interface People {
  text: string;
  icon: string;
}

export interface PeopleDataProps {
  data: People[];
}

export interface Stat {
  count: string;
  description: string;
  color: string;
}

export interface StatisticsProps {
  data: Stat[];
}

interface ColorProps {
  cardBgColor: string;
  cardTextColor: string;
}

export interface Subscription {
  id: number;
  tier: string;
  price: number;
  annualPrice: number;
  approxPerMonth: number;
  discount: string;
  currency: string;
  duration: string;
  usage: string;
  description: string;
  features: string[];
  subscriptionLink: string;
  buttonText: string;
  trialAvailable: boolean;
  isRecommended: boolean;
  color: ColorProps;
  visible: boolean;
}

export interface SubscriptionProps {
  data: Subscription[];
}

export interface PriceCardProps {
  data: Subscription;
  frequency: string;
  currency: string;
  rates?: Record<string, number>;
}

export interface IconDataProps {
  icon: string;
}

export type FeedbackData = {
  user_email: string;
  feedback_type: string;
  feature_name: string;
  feedback_message: string;
  rating: number;
};

export type FieldProps =
  | {
      id: string;
      name: string;
      label: string;
      placeholder: string;
      required: boolean;
      type: "text" | "email" | "textarea";
    }
  | {
      id: string;
      name: string;
      label: string;
      placeholder: string;
      required: boolean;
      type: "select";
      menuItems: string[];
    }
  | {
      id: string;
      name: string;
      label: string;
      required: boolean;
      type: "rating";
    };

export interface PostHogSurveys {
  showSurvey: (surveyId: string) => void;
}

export type FeatureTypes = {
  title: string;
  description: string;
  free: boolean;
  pro: boolean;
};

export interface EmailItemProps {
  email: Email;
  isSelected: boolean;
  onEmailClick: (email: Email) => void;
  onUnsubscribe: (unsubscribeLink: string) => void;
  onActionUpdate?: (emailId: string, action: string) => void;
  formatDate: (dateString: string) => string;
  formatTimestamp: (dateString: string) => string;
}

export type Email = {
  _id: string;
  sender: string;
  dateReceived: string;
  subject: string;
  text: string | undefined;
  processed_at: string;
  received_at: string;
  read: boolean;
  summary: string;
  urgencyScore: number;
  emailUrl: string;
  action?: string;
  emailId: string;
  provider: string;
  emailOwner: string;
  classification: string;
  accessToken?: string;
  body?: string;

  userActionTaken?: string;
  unsubscribeLink?: string;
  keywords?: string[];
  extractedEntities?: {
    senderName: string;
    snippet: string;
    subjectTerms: string[];
    recipientNames: string[];
    attachmentNames: string[];
    date: string;
  };
};
