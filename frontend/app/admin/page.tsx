"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Brain, LogOut, Moon, Pencil, Plus, Search, Sun, Trash2, Users, Zap, BarChart3, Settings, Database } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/components/theme-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const dynamic = "force-dynamic"

interface UserType {
  id: string
  full_name: string
  email: string
  role: "ADMIN" | "CURATOR"
  created_at: string
  last_login: string | null
}

interface AIStats {
  model: string
  version: string
  status: string
  last_updated: string
  stats: {
    total_requests: number
    last_24h_requests: number
    avg_response_time: number
    success_rate: number
  }
  generation_settings: {
    temperature: number
    max_length: number
    report_format: string
    language: string
    style: string
    include_recommendations: boolean
  }
  models: Array<{ name: string; description: string }>
}

export default function AdminPage() {
  const { user, logout, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "CURATOR",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("users")
  const [aiStats, setAiStats] = useState<AIStats | null>(null)
  const [aiStatsLoading, setAiStatsLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        console.log("AdminPage: No user, skipping fetch")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("AdminPage: No token, redirecting to login")
        setError("Токен отсутствует. Пожалуйста, войдите снова.")
        return
      }

      try {
        console.log("AdminPage: Fetching users")
        const response = await fetch(`${API_URL}/api/users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
          })

          if (refreshResponse.ok) {
            const { access } = await refreshResponse.json()
            localStorage.setItem("access_token", access)
            const retryResponse = await fetch(`${API_URL}/api/users/`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json",
              },
            })

            if (!retryResponse.ok) {
              throw new Error(`HTTP error: ${retryResponse.status}`)
            }

            const data = await retryResponse.json()
            setUsers(data)
            setFilteredUsers(data)
          } else {
            throw new Error("Token refresh failed")
          }
        } else if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        } else {
          const data = await response.json()
          setUsers(data)
          setFilteredUsers(data)
        }
      } catch (err) {
        console.error("AdminPage: Error fetching users:", err)
        setError("Не удалось загрузить пользователей. Попробуйте снова.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  useEffect(() => {
    const fetchAiStats = async () => {
      if (!user) return

      setAiStatsLoading(true)
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("Токен отсутствует. Пожалуйста, войдите снова.")
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/ai-stats/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
          })

          if (refreshResponse.ok) {
            const { access } = await refreshResponse.json()
            localStorage.setItem("access_token", access)
            const retryResponse = await fetch(`${API_URL}/api/ai-stats/`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json",
              },
            })

            if (!retryResponse.ok) {
              throw new Error("Failed to fetch AI stats after token refresh")
            }

            const data = await retryResponse.json()
            setAiStats(data)
          } else {
            throw new Error("Token refresh failed")
          }
        } else if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        } else {
          const data = await response.json()
          setAiStats(data)
        }
      } finally {
        setAiStatsLoading(false)
      }
    }

    fetchAiStats()
  }, [user])

  useEffect(() => {
    let result = [...users]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) => user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(result)
  }, [searchQuery, roleFilter, users])

  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      setError("Заполните все поля")
      return
    }

    if (newUser.password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Токен отсутствует. Пожалуйста, войдите снова.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const newUserData = await response.json()
        setUsers((prev) => [...prev, newUserData])
        setIsAddUserOpen(false)
        setNewUser({ full_name: "", email: "", role: "CURATOR", password: "" })
        setError(null)
      } else {
        const data = await response.json()
        setError(data.error || Object.values(data).join(", ") || "Ошибка при добавлении пользователя")
      }
    } catch (err) {
      console.error("AdminPage: Error adding user:", err)
      setError("Не удалось добавить пользователя. Попробуйте снова.")
    }
  }

  const openEditDialog = (user: UserType) => {
    setCurrentUser({ ...user })
    setIsEditUserOpen(true)
  }

  const handleEditUser = async () => {
    if (!currentUser || !currentUser.full_name || !currentUser.email) {
      setError("Заполните все поля")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Токен отсутствует. Пожалуйста, войдите снова.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${currentUser.id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: currentUser.full_name,
          email: currentUser.email,
          role: currentUser.role,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
        setIsEditUserOpen(false)
        setCurrentUser(null)
        setError(null)
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка при редактировании пользователя")
      }
    } catch (err) {
      console.error("AdminPage: Error editing user:", err)
      setError("Не удалось отредактировать пользователя. Попробуйте снова.")
    }
  }

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find((u) => u.id === id)
    if (userToDelete && userToDelete.role === "ADMIN") {
      setError("Невозможно удалить администратора")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Токен отсутствует. Пожалуйста, войдите снова.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || "Ошибка при удалении пользователя")
      }
    } catch (err) {
      console.error("AdminPage: Error deleting user:", err)
      setError("Не удалось удалить пользователя. Попробуйте снова.")
    }
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      console.log("AdminPage: No user or not admin, redirecting to /login")
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {loading ? "Загрузка..." : "Загрузка пользователей..."}
        </div>
      </div>
    )
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/courses">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Назад</span>
              </Link>
            </Button>
            <h1 className="text-xl font-medium">Панель администратора</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user.fullName}</span>
            <span className="text-sm font-medium text-muted-foreground">
              ({user.role === 'CURATOR' ? 'Куратор' : user.role === 'ADMIN' ? 'Админ' : user.role})
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Переключить тему</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log("AdminPage: Initiating logout")
                logout()
              }}
              className="rounded-full"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-medium">Управление системой</h2>
            </div>
            <TabsList className="bg-muted/80 dark:bg-muted/30">
              <TabsTrigger
                value="users"
                className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background/80"
              >
                <Users className="h-4 w-4" />
                <span>Пользователи</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background/80"
              >
                <Brain className="h-4 w-4" />
                <span>Нейросеть</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-medium">Управление пользователями</h3>
                <p className="text-muted-foreground">Управление администраторами и кураторми</p>
              </div> 

              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить пользователя
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить нового пользователя</DialogTitle>
                    <DialogDescription>Заполните форму для добавления нового пользователя в систему</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Имя и фамилия</Label>
                      <Input
                        id="full_name"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                        placeholder="Иван Иванов"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="ivan@example.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Роль</Label>
                      <RadioGroup
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CURATOR" id="curator" />
                          <Label htmlFor="curator" className="cursor-pointer">
                            Куратор
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ADMIN" id="admin" />
                          <Label htmlFor="admin" className="cursor-pointer">
                            Администратор
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddUser}>Добавить</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать пользователя</DialogTitle>
                  <DialogDescription>Измените данные пользователя</DialogDescription>
                </DialogHeader>

                {currentUser && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-full_name">Имя и фамилия</Label>
                      <Input
                        id="edit-full_name"
                        value={currentUser.full_name}
                        onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={currentUser.email}
                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Роль</Label>
                      <RadioGroup
                        value={currentUser.role}
                        onValueChange={(value) =>
                          setCurrentUser({ ...currentUser, role: value as "ADMIN" | "CURATOR" })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CURATOR" id="edit-curator" />
                          <Label htmlFor="edit-curator" className="cursor-pointer">
                            Куратор
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ADMIN" id="edit-admin" />
                          <Label htmlFor="edit-admin" className="cursor-pointer">
                            Администратор
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-destructive text-sm">{error}</div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleEditUser}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по имени или email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Фильтр по роли" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все роли</SelectItem>
                      <SelectItem value="ADMIN">Администраторы</SelectItem>
                      <SelectItem value="CURATOR">Кураторы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Пользователи</CardTitle>
                  <p className="text-sm text-muted-foreground">Всего: {filteredUsers.length}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <div className="p-4 text-destructive text-center">{error}</div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium">Пользователь</th>
                        <th className="text-left p-4 font-medium">Роль</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Дата регистрации</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Последний вход</th>
                        <th className="text-right p-4 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                                {user.role === "ADMIN" ? "Администратор" : "Куратор"}
                              </Badge>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              {new Date(user.created_at).toLocaleDateString("ru-RU")}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              {user.last_login
                                ? new Date(user.last_login).toLocaleDateString("ru-RU")
                                : "Нет данных"}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-background dark:hover:bg-background/80"
                                        onClick={() => openEditDialog(user)}
                                      >
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                        <span className="sr-only">Редактировать</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Редактировать</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                        onClick={() => handleDeleteUser(user.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Удалить</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Удалить</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>Пользователи не найдены</p>
                            <p className="text-sm">Попробуйте изменить параметры поиска или фильтрации</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Настройки нейросети</h3>
            </div>

            {aiStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Загрузка данных...</div>
              </div>
            ) : aiStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border dark:border-border/30 dark:bg-card/95">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Информация о модели</CardTitle>
                        <CardDescription>Основные параметры используемой нейросети</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Модель:</div>
                      <div className="text-sm">{aiStats.model}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Версия:</div>
                      <div className="text-sm">{aiStats.version}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Статус:</div>
                      <div className="text-sm">
                        <Badge className="bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white">
                          {aiStats.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Последнее обновление:</div>
                      <div className="text-sm">{aiStats.last_updated}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border dark:border-border/30 dark:bg-card/95">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Статистика использования</CardTitle>
                        <CardDescription>Данные об использовании нейросети</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Всего запросов:</div>
                      <div className="text-sm">{aiStats.stats.total_requests}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">За последние 24 часа:</div>
                      <div className="text-sm">{aiStats.stats.last_24h_requests}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Среднее время ответа:</div>
                      <div className="text-sm">{aiStats.stats.avg_response_time} сек</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Успешные запросы:</div>
                      <div className="text-sm">{aiStats.stats.success_rate}%</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-destructive">
                Не удалось загрузить данные о нейросети.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}