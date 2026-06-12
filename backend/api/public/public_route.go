package public

func (r *PublicRoute) RegisterLoginRoute() {
	r.handler.POST("/login", r.login.Login)
	r.handler.POST("/register", r.register.Register)
}
