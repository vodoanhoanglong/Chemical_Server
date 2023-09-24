INSERT INTO public.categories (code, name, description) 
VALUES 
('CT001', 'Chất Kích Thích', 'Thử đi không thích thì nhích'),
('CT002', 'Chất Gây Nghiện', 'Thử đi không nghiện mới  lạ'),
('CT003', 'Chất Gây Cửng', 'Nhìn em cưng quá mà là cưng mà nói')
ON CONFLICT DO NOTHING;


INSERT INTO public.products ("categoryId", code, name, description, price, images) 
VALUES 
((SELECT "id" FROM categories WHERE "code" = 'CT001'), 'P001', 'Thuốc phiện', 'Thuốc phiện lorem', 50000, '["https://plus.unsplash.com/premium_photo-1683121324305-1a1deb1c5aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"]'),
((SELECT "id" FROM categories WHERE "code" = 'CT002'), 'P002','Bánh mì', 'Bánh mì không nghiện mới lạ', 10000, '["https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80"]'),
((SELECT "id" FROM categories WHERE "code" = 'CT003'), 'P003', 'Sữa', 'Sữa Gây Cửng', 5000, '["https://plus.unsplash.com/premium_photo-1677607237294-b041e4b57391?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"]')
ON CONFLICT DO NOTHING;