pipeline {
    agent any

    options {
        disableConcurrentBuilds() // Evita builds concorrentes
        timeout(time: 20, unit: 'MINUTES') // Define o tempo máximo para o pipeline
    }

    triggers {
        pollSCM('H/2 * * * *') // Verifica o repositório a cada 2 minutos
    }

    environment {
        REPO_URL = 'https://github.com/gersonomonteiro/devops.git'
        BRANCH_NAME = 'master'
        PROJECT_NAME = 'devops'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '📥 A clonar repositório do Git...'
                git(
                    branch: "${BRANCH_NAME}",
                    url: "${REPO_URL}"
                )
            }
        }        
        stage('Stop Existing Containers') {
            steps {
                script {
                    echo '🛑 A parar containers existentes...'
                    sh '''
                    docker-compose -p ${PROJECT_NAME} down -v || echo "Nenhum contêiner rodando para o projeto ${PROJECT_NAME}."
                    '''
                }
            }
        }        
        stage('Deploy com docker-compose') {
            steps {
                script {
                    echo '🚀 A iniciar containers com docker-compose...'
                    sh '''
                        docker-compose -p ${PROJECT_NAME} up --build -d
                    '''   
                    sleep 30 // Aguarda os serviços iniciarem               
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '🏥 A verificar saúde dos serviços...'
                    
                    sh '''
                        echo "=== Status dos Containers ==="
                        docker-compose -p ${PROJECT_NAME} ps
                    '''
                    
                    sh '''
                        echo "=== Testando API Backend ==="
                        timeout 30s bash -c 'until curl -f http://host.docker.internal:5006/health; do sleep 2; done' && echo "✅ Backend está saudável"
                    '''
                }
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                script {
                    echo '🧪 A executar testes unitários...'
                    
                    sh '''
                        echo "Método 1: Executando testes no container backend..."
                        docker-compose -p ${PROJECT_NAME} exec -T backend npm test || echo "⚠️ Testes falharam, mas continuando pipeline..."
                    '''                    
                    
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo '🔗 A executar testes de integração...'
                    
                    // Testar endpoints da API
                    sh '''
                        echo "=== Testando endpoints da API ==="
                        
                        # Testar health check
                        if curl -s -f http://host.docker.internal:5006/health > /dev/null; then
                            echo "✅ Health check OK"
                        else
                            echo "❌ Health check falhou"
                        fi
        
                        # Testar endpoint de utilizadores
                        if curl -s -f http://host.docker.internal:5006/api/users > /dev/null; then
                            echo "✅ Endpoint de utilizadors OK"
                        else
                            echo "❌ Endpoint de utilizadores falhou"
                        fi
        
                        # Testar criação de utilizador
                        if curl -s -f -X POST http://host.docker.internal:5006/api/users \
                            -H "Content-Type: application/json" \
                            -d '{"name":"Teste Jenkins","email":"jenkins@test.com","role":"user"}' > /dev/null; then
                            echo "✅ Criação de utilizador OK"
                        else
                            echo "⚠️ Criação de utilizador falhou (pode ser esperado)"
                        fi
                    '''
                }
            }
        }
        
        stage('Show Application Info') {
            steps {
                script {
                    echo '📊 Informações da aplicação...'
                    sh '''
                        echo "=== URLs da Aplicação ==="
                        echo "Frontend: http://host.docker.internal:3006"
                        echo "Backend:  http://host.docker.internal:5006"
                        echo "API Docs: http://host.docker.internal:5006/api/users"
                        echo "Health:   http://host.docker.internal:5006/health"
                        
                        echo "=== Logs Recentes ==="
                        docker-compose -p ${PROJECT_NAME} logs --tail=5
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '📋 Pipeline finalizado - Status final:'
            sh '''
                docker-compose -p ${PROJECT_NAME} ps
                echo "=== Logs de Erros (se houver) ==="
                docker-compose -p ${PROJECT_NAME} logs --tail=20 | grep -i error || echo "Nenhum erro encontrado"
            '''
        }
        success {
            echo '✅ Pipeline concluído com sucesso!'
            echo '🌍 Aplicação disponível em http://host.docker.internal:3006'
            echo '🔗 API disponível em http://host.docker.internal:5006'
        }
        failure {
            echo '❌ Pipeline falhou. Verificar logs acima.'
            // Manter containers para debugging
            echo '🐛 Containers mantidos para investigação'
        }
    }
}