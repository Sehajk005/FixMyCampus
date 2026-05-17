const { Ticket, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const resolvers = {
  Query: {
    ticketStats: async () => {
      const tickets = await Ticket.findAll({ attributes: ['status'] });
      
      const stats = {
        total: tickets.length,
        submitted: 0,
        assigned: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      };

      tickets.forEach(t => {
        if (stats[t.status] !== undefined) {
          stats[t.status]++;
        } else if (t.status === 'verified') {
          stats.submitted++; // Treat verified as submitted or just count it
        }
      });

      return stats;
    },

    technicianWorkload: async () => {
      // Find all users with role 'technician'
      const techs = await User.findAll({ where: { role: 'technician' } });
      const tickets = await Ticket.findAll({
        where: { assigned_to: { [Op.ne]: null } },
        attributes: ['assigned_to', 'status', 'created_at', 'updated_at']
      });

      const workload = techs.map(tech => ({
        id: tech.id,
        name: tech.name,
        active_tickets: 0,
        completed_tickets: 0,
        avg_resolution_time: 0,
        score: Math.floor(Math.random() * 20) + 80 // Mock score between 80-100
      }));

      const workMap = {};
      workload.forEach(w => workMap[w.id] = w);

      tickets.forEach(t => {
        const w = workMap[t.assigned_to];
        if (w) {
          if (['resolved', 'closed'].includes(t.status)) {
            w.completed_tickets++;
            // Calculate time diff in hours
            const diffHours = (new Date(t.updated_at) - new Date(t.created_at)) / (1000 * 60 * 60);
            w.avg_resolution_time += diffHours;
          } else {
            w.active_tickets++;
          }
        }
      });

      return workload.map(w => {
        if (w.completed_tickets > 0) {
          w.avg_resolution_time = w.avg_resolution_time / w.completed_tickets;
        }
        return w;
      });
    },

    avgResolutionTime: async () => {
      // Return a mocked 7-day trend for chart visualization
      return [
        { date: 'Mon', avg_hours: 4.5 },
        { date: 'Tue', avg_hours: 5.2 },
        { date: 'Wed', avg_hours: 4.0 },
        { date: 'Thu', avg_hours: 3.8 },
        { date: 'Fri', avg_hours: 6.1 },
        { date: 'Sat', avg_hours: 2.5 },
        { date: 'Sun', avg_hours: 3.0 }
      ];
    },

    ticketsByCategory: async () => {
      const counts = await Ticket.findAll({
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['category']
      });
      return counts.map(c => ({
        category: c.category,
        count: parseInt(c.get('count'), 10)
      }));
    },

    priorityDistribution: async () => {
      const counts = await Ticket.findAll({
        attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['priority']
      });
      return counts.map(c => ({
        priority: c.priority,
        count: parseInt(c.get('count'), 10)
      }));
    },

    heatmapData: async () => {
      // Mocked heatmap data because exact lat/lng is not stored
      return [
        { lat: 28.7041, lng: 77.1025, weight: 0.8 },
        { lat: 28.7051, lng: 77.1035, weight: 0.5 },
        { lat: 28.7061, lng: 77.1045, weight: 0.9 },
      ];
    }
  }
};

module.exports = resolvers;
