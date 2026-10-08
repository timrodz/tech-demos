export const validSpec = {
  root: 'dashboard',
  elements: {
    dashboard: {
      type: 'Stack',
      props: {
        direction: 'vertical',
        gap: 'lg',
      },
      children: ['header', 'metrics', 'actions'],
    },
    header: {
      type: 'Card',
      props: {
        title: 'Analytics Dashboard',
        subtitle: 'Real-time performance metrics',
      },
      children: ['description'],
    },
    description: {
      type: 'Text',
      props: {
        content: 'Monitor your key business metrics in real-time.',
        size: 'sm',
      },
    },
    metrics: {
      type: 'Stack',
      props: {
        direction: 'horizontal',
        gap: 'md',
      },
      children: ['metric1', 'metric2', 'metric3'],
    },
    metric1: {
      type: 'Card',
      props: {
        title: 'Revenue',
      },
      children: ['revenueMetric'],
    },
    revenueMetric: {
      type: 'Metric',
      props: {
        label: 'Total Revenue',
        value: '$125,430',
        trend: '+12.5%',
      },
    },
    metric2: {
      type: 'Card',
      props: {
        title: 'Users',
      },
      children: ['usersMetric'],
    },
    usersMetric: {
      type: 'Metric',
      props: {
        label: 'Active Users',
        value: '8,234',
        trend: '+8.2%',
      },
    },
    metric3: {
      type: 'Card',
      props: {
        title: 'Conversion',
      },
      children: ['conversionMetric'],
    },
    conversionMetric: {
      type: 'Metric',
      props: {
        label: 'Conversion Rate',
        value: '3.8%',
        trend: '+0.3%',
      },
    },
    actions: {
      type: 'Card',
      props: {
        title: 'Quick Actions',
      },
      children: ['actionsList', 'buttons'],
    },
    actionsList: {
      type: 'List',
      props: {
        items: [
          'Export dashboard data',
          'Schedule automated reports',
          'Configure alerts and notifications',
        ],
      },
    },
    buttons: {
      type: 'Stack',
      props: {
        direction: 'horizontal',
        gap: 'sm',
      },
      children: ['button1', 'button2'],
    },
    button1: {
      type: 'Button',
      props: {
        label: 'Export Data',
        variant: 'primary',
      },
    },
    button2: {
      type: 'Button',
      props: {
        label: 'View Details',
        variant: 'secondary',
      },
    },
  },
};

export const invalidComponentSpec = {
  type: 'InvalidWidget',
  props: {
    title: 'This component is not in the catalog',
  },
};
