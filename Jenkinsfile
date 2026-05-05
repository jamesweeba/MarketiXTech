pipeline {
    agent {
        label "docker3"
    }
    environment {
        REG_AML_CRED    = credentials('REG_AML_CRED')
        SERVICE         = "marketixtech"
        registry_URL    = "reg-aml.esoko.com"

        // Dev image
        IMAGE           = "reg-aml.esoko.com/deveops-test.img/marketixtech-web"
        TAG             = "alpha"

        // Prod image
        imageName       = "reg-aml.esoko.com/deveops-test.img/marketixtech-web"

        imageTag        = "${env.BUILD_ID}"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Init Environment') {
            steps {
                script {
                    env.TAG_NAME = sh(script: "git tag --points-at=HEAD || echo 'none'", returnStdout: true).trim()
                    echo "TAG_NAME = ${env.TAG_NAME}"
                }
            }
        }

        stage("Trivy Repo Scan") {
            steps {
                script {
                    echo "Running Trivy File System Scan (pre-build)..."
                    sh """
                        mkdir -p trivy-reports

                        docker run --rm \
                          -v \$(pwd):/src \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 fs /src \
                          --exit-code 0 \
                          --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                          --format json \
                          --output /reports/trivy-fs-report.json

                        docker run --rm \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                          --format template --template "@/contrib/html.tpl" \
                          --output /reports/trivy-fs-report.html \
                          /reports/trivy-fs-report.json
                    """
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-fs-report.html',
                        reportName: 'Trivy Repo (FS) Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-fs-report.*', fingerprint: true
                }
            }
        }

        stage("Build and Push - Dev") {
            when {
                anyOf { branch 'develop'; branch 'main'; branch 'master'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                sh "echo '${REG_AML_CRED_PSW}' | docker login -u ${REG_AML_CRED_USR} --password-stdin ${registry_URL}"
                sh "docker build -t ${env.IMAGE}:${env.TAG} ."
                sh "docker push ${env.IMAGE}:${env.TAG}"
            }
        }

        stage("Prune after Dev build") {
            when {
                anyOf { branch 'develop'; branch 'main'; branch 'master'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                sh "docker system prune -f"
            }
        }

        stage("Trivy Image Scan Dev") {
            when {
                anyOf { branch 'develop'; branch 'main'; branch 'master'; branch 'Sprint*'; branch 'Hotfix*'; branch 'sprint*'; branch 'feature/*'; branch 'cicd-feature/*' }
            }
            steps {
                script {
                    echo "Running Trivy Image Scan (post-build)..."
                    sh """
                        mkdir -p trivy-reports

                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 image \
                          --username ${REG_AML_CRED_USR} \
                          --password ${REG_AML_CRED_PSW} \
                          --exit-code 0 \
                          --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                          --format json \
                          --output /reports/trivy-image-report.json \
                          ${env.IMAGE}:${env.TAG}

                        docker run --rm \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                          --format template --template "@/contrib/html.tpl" \
                          --output /reports/trivy-image-report.html \
                          /reports/trivy-image-report.json
                    """
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-image-report.html',
                        reportName: 'Trivy Image Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-image-report.*', fingerprint: true
                }
            }
        }

        stage("Build - prod") {
            when { tag "v*" }
            steps {
                sh "docker build -t ${env.imageName}:${env.TAG_NAME} ."
            }
        }

        stage("Trivy Image Scan - PROD") {
            when { tag "v*" }
            steps {
                script {
                    echo "Running Trivy Image Scan for PROD image..."
                    sh """
                        mkdir -p trivy-reports

                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 image \
                          --exit-code 0 \
                          --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
                          --format json \
                          --output /reports/trivy-prod-image-report.json \
                          ${env.imageName}:${env.TAG_NAME}

                        docker run --rm \
                          -v \$(pwd)/trivy-reports:/reports \
                          reg-aml.esoko.com/develop.esoko/trivy:0.69.3 convert \
                          --format template --template "@/contrib/html.tpl" \
                          --output /reports/trivy-prod-image-report.html \
                          /reports/trivy-prod-image-report.json
                    """
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'trivy-reports',
                        reportFiles: 'trivy-prod-image-report.html',
                        reportName: 'Trivy PROD Image Scan'
                    ])
                    archiveArtifacts artifacts: 'trivy-reports/trivy-prod-image-report.*', fingerprint: true
                }
            }
        }

        stage("release") {
            when { tag "v*" }
            steps {
                sh "echo '${REG_AML_CRED_PSW}' | docker login -u ${REG_AML_CRED_USR} --password-stdin ${registry_URL}"
                sh "docker push ${env.imageName}:${env.TAG_NAME}"
            }
        }
    }

    post {
        // success {
        //     script {
        //         slackSend(
        //             color: '#00FF00',
        //             message: "Build succeeded: ${currentBuild.fullDisplayName}",
        //             channel: '#devops-notify'
        //         )
        //     }
        // }
        // failure {
        //     script {
        //         slackSend(
        //             color: '#FF0000',
        //             message: "Build FAILED: ${currentBuild.fullDisplayName}\nLogs: ${env.BUILD_URL}",
        //             channel: '#devops-notify'
        //         )
        //     }
        // }
        always {
            cleanWs(
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true,
                patterns: [[pattern: '.gitignore', type: 'INCLUDE'],
                           [pattern: '.propsfile', type: 'EXCLUDE']]
            )
        }
    }
}
