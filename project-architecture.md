# Server
    service = tudo que é regra de negócio ou processamento
    controller = intermediar a camada de apresentação e a camada de negócio
    routes = camada de apresentação
    server = responsável por criar o servidor (mas não instancia)
    index = instancia o servidor e expoe para a web (lado da infraestrutura)
    config = tudo que for estático do projeto

# Cliente
    service = tudo que é regra de negócio ou processamento
    controller = é o intermédio entre a view e o service
    view = tudo que é elemento HTML (visualização)
    index = Factory = é quem inicializa tudo