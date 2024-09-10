# NODEJS API SOLID - gympass style app

## Requisitos Funcionais

- [ ] Dever ser possível se cadastrar;
- [ ] Dever ser possível se autenticar;
- [ ] Dever ser possível obter o perfil de um usuário logado;
- [ ] Dever ser possível obter o número de check-ins realizados pelo usuário logado;
- [ ] Dever ser possível o usuário obter seu histórico de check-ins;
- [ ] Dever ser possível o usuário buscar academias próximas;
- [ ] Dever ser possível o usuário buscar academias pelo nome;
- [ ] Dever ser possível o usuário realizar check-in em uma academia;
- [ ] Dever ser possível validar o check-in de um usuário;
- [ ] Dever ser possível cadastrar uma academia;

## Regras de negócio

- [ ] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [ ] O usuário não pode fazer check-in no mesmo dia;
- [ ] O usuário não pode fazer check-in se não tiver perto (100m) da academia;
- [ ] O check-in só pode ser validado até 20 minutos após criado;
- [ ] O check-in só pode ser validado por administradores;
- [ ] A academia só pode ser cadastrada por administradores;

## Requisitos não funcionais

- [ ] A senha do usuário precisa estar criptografada;
- [ ] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [ ] Todas listas de dados precisam estar paginadas com 20 itens por páginas;
- [ ] O usuário deve ser identificado por um JWT (JSON Web Token)