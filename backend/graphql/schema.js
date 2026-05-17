const typeDefs = `#graphql
  type TicketStats {
    total: Int!
    submitted: Int!
    assigned: Int!
    in_progress: Int!
    resolved: Int!
    closed: Int!
  }

  type TechnicianWorkload {
    id: ID!
    name: String!
    active_tickets: Int!
    completed_tickets: Int!
    avg_resolution_time: Float
    score: Int
  }

  type CategoryCount {
    category: String!
    count: Int!
  }

  type ResolutionTrend {
    date: String!
    avg_hours: Float!
  }

  type PriorityDistribution {
    priority: String!
    count: Int!
  }

  type HeatmapData {
    lat: Float!
    lng: Float!
    weight: Float!
  }

  type Query {
    ticketStats: TicketStats!
    technicianWorkload: [TechnicianWorkload!]!
    avgResolutionTime: [ResolutionTrend!]!
    ticketsByCategory: [CategoryCount!]!
    heatmapData: [HeatmapData!]!
    priorityDistribution: [PriorityDistribution!]!
  }
`;

module.exports = typeDefs;
