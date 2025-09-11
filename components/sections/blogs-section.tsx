import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeDollarSign,
  Bike,
  BookHeart,
  BriefcaseBusiness,
  Calendar,
  ClockIcon,
  Cpu,
  FlaskRound,
  HeartPulse,
  Scale,
} from "lucide-react";

const categories = [
  {
    name: "Technology",
    totalPosts: 10,
    icon: Cpu,
  },
  {
    name: "Business",
    totalPosts: 5,
    icon: BriefcaseBusiness,
  },
  {
    name: "Finance",
    totalPosts: 8,
    icon: BadgeDollarSign,
  },
  {
    name: "Health",
    totalPosts: 12,
    icon: HeartPulse,
  },
  {
    name: "Lifestyle",
    totalPosts: 15,
    icon: BookHeart,
  },
  {
    name: "Politics",
    totalPosts: 20,
    icon: Scale,
  },
  {
    name: "Science",
    totalPosts: 25,
    icon: FlaskRound,
  },
  {
    name: "Sports",
    totalPosts: 30,
    icon: Bike,
  },
];

export const BlogsSection = () => {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col items-start gap-12 px-6 py-10 lg:flex-row lg:py-16 xl:px-0">
      <div>
        <div className="space-y-12">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card
              key={i}
              className="flex flex-col overflow-hidden rounded-md border-none py-0 shadow-none sm:flex-row sm:items-center"
            >
              <div className="bg-muted aspect-video shrink-0 grow rounded-lg sm:aspect-square sm:w-56" />
              <CardContent className="flex flex-col px-0 py-0 sm:px-6">
                <div className="flex items-center gap-6">
                  <Badge className="bg-primary/5 text-primary hover:bg-primary/5 shadow-none">
                    Technology
                  </Badge>
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  A beginner&apos;s guide to blackchain for engineers
                </h3>
                <p className="text-muted-foreground mt-2 line-clamp-3 text-ellipsis">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa
                  consequatur minus dicta accusantium quos, ratione suscipit id
                  adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur
                  dolores.
                </p>
                <div className="text-muted-foreground mt-4 flex items-center gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" /> 5 min read
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Nov 20, 2024
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <aside className="sticky top-8 w-full shrink-0 lg:max-w-sm">
        <h3 className="text-xl font-semibold tracking-tight">Categories</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-muted bg-opacity-15 dark:bg-opacity-25 flex items-center justify-between gap-2 rounded-md p-3"
            >
              <div className="flex items-center gap-3">
                <category.icon className="h-5 w-5" />
                <span className="font-medium">{category.name}</span>
              </div>
              <Badge className="bg-foreground/7 text-foreground rounded-full px-1.5">
                {category.totalPosts}
              </Badge>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
