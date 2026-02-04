'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '@/components/course/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { coursesApi, type CourseFilters } from '@/lib/api/courses';
import { Difficulty } from '@/types';
import { Search, Filter, Grid3x3, List } from 'lucide-react';

export default function CoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.getAll(filters),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    setFilters(prev => ({
      ...prev,
      difficulty: value === 'all' ? undefined : value as Difficulty,
      page: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Tous les cours de programmation
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez notre catalogue complet de cours, du débutant à l'expert
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours, une technologie..."
                className="pl-10 h-12 text-lg"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="BEGINNER">Débutant</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                  <SelectItem value="ADVANCED">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="createdAt-desc" onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Plus récent</SelectItem>
                  <SelectItem value="rating-desc">Mieux notés</SelectItem>
                  <SelectItem value="totalStudents-desc">Plus populaires</SelectItem>
                  <SelectItem value="duration-asc">Plus court</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {coursesData?.meta.total || 0} cours disponibles
              </h2>
              <div className="text-sm text-muted-foreground">
                Page {filters.page} sur {coursesData?.meta.totalPages || 1}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : coursesData?.data.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  Aucun cours ne correspond à votre recherche
                </div>
                <Button onClick={() => {
                  setSearch('');
                  setDifficulty('all');
                  setFilters({ page: 1, limit: 12 });
                }}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }>
                  {coursesData?.data.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant={viewMode === 'grid' ? 'default' : 'compact'}
                      showProgress={true}
                      progress={Math.floor(Math.random() * 100)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coursesData && coursesData.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                      disabled={filters.page === 1}
                    >
                      Précédent
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, coursesData.meta.totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (coursesData.meta.totalPages > 5) {
                          if (filters.page! <= 3) {
                            pageNum = i + 1;
                          } else if (filters.page! >= coursesData.meta.totalPages - 2) {
                            pageNum = coursesData.meta.totalPages - 4 + i;
                          } else {
                            pageNum = filters.page! - 2 + i;
                          }
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={filters.page === pageNum ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                      disabled={filters.page === coursesData.meta.totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-t mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Proposez-nous un sujet de cours ou devenez instructeur
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="outline">
                Proposer un cours
              </Button>
              <Button size="lg">
                Devenir instructeur
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}