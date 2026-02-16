export interface QueryTemplate {
  template: string;
  category: string;
  requiresKeyword: boolean;
  requiresDomain: boolean;
}

export const QUERY_TEMPLATES: QueryTemplate[] = [
  // Brand-specific queries (prioritized first so they always get included)
  {
    template: "What do you know about {domain}?",
    category: "brand_awareness",
    requiresKeyword: false,
    requiresDomain: true,
  },
  {
    template: "Tell me about {domain} and what services they offer {region}",
    category: "brand_awareness",
    requiresKeyword: false,
    requiresDomain: true,
  },
  {
    template: "Is {domain} a good choice for {keyword} {region}?",
    category: "brand_evaluation",
    requiresKeyword: true,
    requiresDomain: true,
  },
  {
    template: "{domain} review - is it a reliable {keyword} provider {region}?",
    category: "brand_evaluation",
    requiresKeyword: true,
    requiresDomain: true,
  },
  {
    template: "Compare {domain} with other {keyword} providers {region}",
    category: "brand_comparison",
    requiresKeyword: true,
    requiresDomain: true,
  },
  // Recommendation queries
  {
    template: "What are the best {keyword} companies {region}?",
    category: "recommendation",
    requiresKeyword: true,
    requiresDomain: false,
  },
  {
    template: "Can you recommend a good {keyword} provider {region}?",
    category: "recommendation",
    requiresKeyword: true,
    requiresDomain: false,
  },
  {
    template: "What are the top {keyword} services {region}?",
    category: "recommendation",
    requiresKeyword: true,
    requiresDomain: false,
  },
  // Problem-solving queries
  {
    template: "I need help with {keyword} {region}, who should I use?",
    category: "problem_solving",
    requiresKeyword: true,
    requiresDomain: false,
  },
  {
    template: "Best tools and services for {keyword} {region}",
    category: "tool_discovery",
    requiresKeyword: true,
    requiresDomain: false,
  },
];
