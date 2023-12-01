pipeline {
    agent any
    
    stages {
        stage('Clone') {
            git 'https://github.com/CMP25-SWE-TEAM1/Backend/'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker compose -f docker-compose-dev.yml build'
            }
        }
        
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    sh "echo $DOCKER_HUB_PASSWORD | docker login --username $DOCKER_HUB_USERNAME --password-stdin"
                    sh 'docker-compose push'
                }
            }
        }
        
        stage('Run') {
            steps {
                sh 'docker compose -f docker-compose-dev.yml up -d'
            }
        }
        
        stage('Prune') {
            steps {
                sh 'docker system prune '
            }
        }
    }
}
