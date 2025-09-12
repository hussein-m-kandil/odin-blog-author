'use client';

// https://ui.shadcn.com/charts/line#charts

import * as React from 'react';
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { AppStatsSkeleton } from './app-stats.skeleton';
import { useAuthData } from '@/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import { Stats } from '@/types';
import { cn } from '@/lib/utils';

const formatTotal = (total: number) => {
  return total > 9999 ? total.toExponential(0) : total;
};

const calcTotal = (statsEntry: Stats[keyof Stats]) => {
  return statsEntry.reduce((acc, curr) => acc + curr.count, 0);
};

const chartConfig = {
  posts: { label: 'Posts', color: 'var(--chart-1)' },
  comments: { label: 'Comments', color: 'var(--chart-2)' },
  images: { label: 'Images', color: 'var(--chart-3)' },
  users: { label: 'Users', color: 'var(--chart-4)' },
  visitors: { label: 'Visitors', color: 'var(--chart-5)' },
} satisfies ChartConfig;

type ChartKey = keyof typeof chartConfig;

const initTotals = { users: 0, posts: 0, images: 0, comments: 0, visitors: 0 };

export function AppStats() {
  const [activeChart, setActiveChart] = React.useState<ChartKey>('comments');

  const {
    authData: { authAxios },
  } = useAuthData();

  const { data, isPending } = useQuery<Stats | null>({
    queryFn: async () => (await authAxios.get('/stats')).data,
    queryKey: ['stats'],
  });

  const totals = React.useMemo<Record<ChartKey, number>>(
    () =>
      Object.entries(data || {}).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: calcTotal(v) }),
        initTotals
      ),
    [data]
  );

  const chartBtnsContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const cleanBorders = () => {
      const chartBtnsContainer = chartBtnsContainerRef.current;
      if (chartBtnsContainer) {
        chartBtnsContainer.childNodes.forEach((node) => {
          const chartBtn = node as HTMLButtonElement;
          if (chartBtn.offsetLeft === chartBtnsContainer.offsetLeft) {
            chartBtn.classList.remove('border-l');
          } else chartBtn.classList.add('border-l');
        });
      }
    };
    window.addEventListener('resize', cleanBorders);
    return () => window.removeEventListener('resize', cleanBorders);
  }, []);

  if (isPending) return <AppStatsSkeleton />;

  if (!data) return null;

  return (
    <Card className='py-4 sm:py-0'>
      <CardHeader
        className={cn(
          'flex flex-col items-stretch !p-0',
          'sm:flex-row *:grow gap-0'
        )}>
        <div
          className={cn(
            'flex flex-col justify-center gap-1 px-6 pb-3',
            'max-lg:basis-2/3 sm:pb-0 sm:border-r border-b'
          )}>
          <CardTitle>App Statistics</CardTitle>
          <CardDescription>Showing totals of certain app data</CardDescription>
        </div>
        <div
          ref={chartBtnsContainerRef}
          className='flex flex-wrap *:max-lg:basis-1/3'>
          {Object.keys(chartConfig).map((key) => {
            const chart = key as ChartKey;
            return (
              <button
                key={chart}
                type='button'
                data-active={activeChart === chart}
                className={cn(
                  'flex flex-1 flex-col justify-center gap-1',
                  'p-3 text-center border-b border-l',
                  'data-[active=true]:bg-muted/50'
                )}
                onClick={() => setActiveChart(chart)}>
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {formatTotal(totals[chart])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'>
          <LineChart
            dataKey='count'
            data={data[activeChart]}
            accessibilityLayer={true}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickMargin={8}
              minTickGap={32}
              tickLine={false}
              axisLine={false}
              interval='preserveStartEnd'
              tickFormatter={(value) => formatDate(value, 'LLL R')}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey={activeChart}
                  labelFormatter={(value) => formatDate(value, 'd LLLL R')}
                />
              }
            />
            <Line
              dataKey='count'
              type='monotone'
              strokeWidth={2}
              stroke={`var(--color-${activeChart})`}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default AppStats;
