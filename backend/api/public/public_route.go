package public

func (r *PublicRoute) RegisterLoginRoute() {
	r.handler.POST("/login", r.api.Login)
}