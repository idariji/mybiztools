import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_KEY = 'dashboard-tour-completed';

export function useDashboardTour() {
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(TOUR_KEY);
    if (hasCompletedTour) return;

    // Small delay to let the page render
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0,0,0,0.5)',
        stagePadding: 8,
        popoverClass: 'mybiztools-tour',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Got it! 🎉',
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '#tour-welcome',
            popover: {
              title: '👋 Welcome to MyBizTools!',
              description:
                'Your all-in-one business management platform. Let us show you around in under a minute.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-stats',
            popover: {
              title: '📊 Your Business at a Glance',
              description:
                'See your total revenue, receipts, pending drafts and document counts here — updated in real time.',
              side: 'bottom',
            },
          },
          {
            element: '#tour-chart',
            popover: {
              title: '📈 Monthly Overview',
              description:
                'This chart shows your invoices and receipts activity over the last 6 months.',
              side: 'top',
            },
          },
          {
            element: '#tour-plan',
            popover: {
              title: '💎 Your Current Plan',
              description:
                'See what your current plan includes and upgrade anytime to unlock unlimited documents and remove watermarks.',
              side: 'top',
            },
          },
          {
            element: '#tour-quick-actions',
            popover: {
              title: '⚡ Quick Actions',
              description:
                'Jump straight into creating invoices, receipts, quotations or payslips with one click.',
              side: 'top',
            },
          },
          {
            element: '#tour-activity',
            popover: {
              title: '🕐 Recent Activity',
              description:
                "Every document you create is logged here so you can track what's been done.",
              side: 'top',
            },
          },
          {
            element: '#tour-alerts',
            popover: {
              title: '🔔 Smart Alerts',
              description:
                'Important reminders and alerts about your account — like plan limits and profile completion.',
              side: 'top',
            },
          },
          {
            popover: {
              title: '🚀 You\'re all set!',
              description:
                'Start by creating your first invoice or receipt. Your data is saved automatically. Enjoy MyBizTools!',
            },
          },
        ],
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timer);
  }, []);
}
