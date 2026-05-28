package enum

type UserRole string

const (
	SuperRole    UserRole = "superadmin"
	AdminRole    UserRole = "admin"
	CustomerRole UserRole = "customer"
)
