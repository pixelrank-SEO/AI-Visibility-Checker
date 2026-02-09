export interface QueryTemplate {
  template: string;
  category: string;
  requiresKeyword: boolean;
  requiresDomain: boolean;
}

export const QUERY_TEMPLATES: QueryTemplate[] = [
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
  // Informational queries
  {
    template: "What do you know about {domain}?",
    category: "brand_awareness",
    requiresKeyword: false,
    requiresDomain: true,
  },
  {
    template: "Is {domain} a good choice for {keyword}?",
    category: "brand_evaluation",
    requiresKeyword: true,
    requiresDomain: true,
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
