import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Heart, 
  Star, 
  Church, 
  Flag,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { cn } from "@/lib/utils";

interface ArmenianEvent {
  id: string;
  title: string;
  date: string; // MM-DD format
  type: 'religious' | 'national' | 'cultural' | 'historical';
  description: string;
  significance: string;
  traditions?: string[];
  greeting?: string; // Armenian greeting
}

interface ArmenianCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const armenianEvents: ArmenianEvent[] = [
  {
    id: '01-01',
    title: 'New Year (Amanor)',
    date: '01-01',
    type: 'cultural',
    description: 'Armenian New Year celebration with traditional customs.',
    significance: 'New beginnings and family gatherings',
    traditions: ['Family meals', 'Gift giving', 'Visiting relatives'],
    greeting: 'Shnorhavor Nor Tari!'
  },
  {
    id: '01-06',
    title: 'Armenian Christmas (Surb Tsnund)',
    date: '01-06',
    type: 'religious',
    description: 'Armenian Apostolic Church celebrates the birth of Jesus Christ.',
    significance: 'The most important Christian holiday for Armenians',
    traditions: ['Church services', 'Family gatherings', 'Traditional meals', 'Gift giving'],
    greeting: 'Shnorhavor Surb Tsnund!'
  },
  {
    id: '02-14',
    title: 'St. Sarkis Day',
    date: '02-14',
    type: 'religious',
    description: 'Day honoring St. Sarkis, patron saint of youth and love.',
    significance: 'Traditional matchmaking and blessing of young couples',
    traditions: ['Eating salty cookies', 'Dreams about future spouse', 'Church blessings'],
    greeting: 'Shnorhavor Surb Sarkis!'
  },
  {
    id: '03-08',
    title: 'International Women\'s Day',
    date: '03-08',
    type: 'cultural',
    description: 'Celebration of women and their contributions to society.',
    significance: 'Honoring Armenian women\'s strength and achievements',
    traditions: ['Giving flowers', 'Family celebrations', 'Recognizing achievements']
  },
  {
    id: '04-24',
    title: 'Armenian Genocide Remembrance Day',
    date: '04-24',
    type: 'historical',
    description: 'Day of remembrance for the victims of the Armenian Genocide.',
    significance: 'Never forget - honoring 1.5 million victims',
    traditions: ['Memorial services', 'Laying flowers', 'Educational events', 'Community gatherings']
  },
  {
    id: '05-09',
    title: 'Victory Day (Haghtoghutyan Or)',
    date: '05-09',
    type: 'national',
    description: 'Celebrating victory in World War II and Armenian heroes.',
    significance: 'Honoring Armenian veterans and fallen soldiers',
    traditions: ['Memorial ceremonies', 'Visiting monuments', 'Family stories']
  },
  {
    id: '05-28',
    title: 'Republic Day',
    date: '05-28',
    type: 'national',
    description: 'Independence Day of the First Republic of Armenia (1918).',
    significance: 'Birth of modern Armenian statehood',
    traditions: ['Flag ceremonies', 'Cultural events', 'Historical remembrance']
  },
  {
    id: '09-21',
    title: 'Independence Day',
    date: '09-21',
    type: 'national',
    description: 'Independence of the Republic of Armenia from Soviet Union (1991).',
    significance: 'Modern Armenian independence and sovereignty',
    traditions: ['Parades', 'Cultural festivals', 'National celebrations'],
    greeting: 'Shnorhavor Ankakhutyan Or!'
  },
  {
    id: '10-14',
    title: 'Motherhood and Beauty Day',
    date: '10-14',
    type: 'cultural',
    description: 'Special day honoring Armenian mothers and feminine beauty.',
    significance: 'Celebrating the sacred role of Armenian mothers',
    traditions: ['Honoring mothers', 'Family gatherings', 'Appreciation ceremonies']
  },
  {
    id: '11-22',
    title: 'St. Cecilia Day (Surb Geghard)',
    date: '11-22',
    type: 'religious',
    description: 'Feast day of St. Cecilia, patron of music.',
    significance: 'Celebrating Armenian musical heritage',
    traditions: ['Musical performances', 'Church concerts', 'Cultural events']
  },
  {
    id: '12-31',
    title: 'New Year\'s Eve',
    date: '12-31',
    type: 'cultural',
    description: 'Last day of the year, preparation for new beginnings.',
    significance: 'Reflection and hope for the future',
    traditions: ['Family dinners', 'Midnight celebrations', 'Resolutions']
  }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'religious': return <Church className="h-4 w-4" />;
    case 'national': return <Flag className="h-4 w-4" />;
    case 'historical': return <BookOpen className="h-4 w-4" />;
    case 'cultural': return <Users className="h-4 w-4" />;
    default: return <Star className="h-4 w-4" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'religious': return 'bg-blue-500';
    case 'national': return 'bg-red-500';
    case 'historical': return 'bg-purple-500';
    case 'cultural': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const ArmenianCalendar = ({ open, onOpenChange }: ArmenianCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<ArmenianEvent | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getCurrentMonthEvents = () => {
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    return armenianEvents.filter(event => event.date.startsWith(monthStr));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const currentDateStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    return armenianEvents
      .filter(event => event.date >= currentDateStr)
      .slice(0, 3);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const todaysEvents = () => {
    const today = new Date();
    const todayStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return armenianEvents.filter(event => event.date === todayStr);
  };

  const currentMonthEvents = getCurrentMonthEvents();
  const upcomingEvents = getUpcomingEvents();
  const todayEvents = todaysEvents();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArmenianIcon className="h-6 w-6" />
            Armenian Cultural Calendar
            <Badge variant="secondary" className="ml-2">
              {armenianEvents.length} events
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Month Events */}
          <div className="lg:col-span-2 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[50vh]">
              <div className="space-y-3">
                {currentMonthEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No Armenian events this month</p>
                  </div>
                ) : (
                  currentMonthEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg text-white",
                          getEventColor(event.type)
                        )}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.date.split('-')[1]}/{event.date.split('-')[0]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          {event.greeting && (
                            <p className="text-sm font-medium text-primary">
                              {event.greeting}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Today's Events */}
            {todayEvents.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Today's Events
                </h3>
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="p-2 bg-accent/50 rounded">
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.greeting && (
                        <p className="text-xs text-primary">{event.greeting}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Upcoming Events
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getEventColor(event.type)
                      )} />
                      <p className="font-medium text-sm">{event.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.date.split('-')[1]}/{event.date.split('-')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Event Types</h3>
              <div className="space-y-2">
                {[
                  { type: 'religious', label: 'Religious' },
                  { type: 'national', label: 'National' },
                  { type: 'historical', label: 'Historical' },
                  { type: 'cultural', label: 'Cultural' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      getEventColor(type)
                    )} />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getEventIcon(selectedEvent.type)}
                  {selectedEvent.title}
                  <Badge variant="outline">
                    {selectedEvent.date.split('-')[1]}/{selectedEvent.date.split('-')[0]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Significance</h4>
                  <p className="text-muted-foreground">{selectedEvent.significance}</p>
                </div>
                
                {selectedEvent.traditions && (
                  <div>
                    <h4 className="font-semibold mb-2">Traditions</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedEvent.traditions.map((tradition, index) => (
                        <li key={index}>{tradition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedEvent.greeting && (
                  <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                    <h4 className="font-semibold mb-1">Traditional Greeting</h4>
                    <p className="text-primary font-medium">{selectedEvent.greeting}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
