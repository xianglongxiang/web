module.exports = function (grunt) {

    // 构建任务配置
    grunt.initConfig({

        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),

        //压缩js
        uglify: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        cwd: 'js/',
                        src: '*.js',
                        dest: 'dest/js'
                    }
                ]
            }
        },

        //压缩css
        cssmin: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                //美化代码
                beautify: {
                    //中文ascii化，非常有用！防止中文乱码的神配置
                    ascii_only: true
                }
            },
            my_target: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        cwd: 'css/',
                        src: '*.css',
                        dest: 'dest/css'
                    }
                ]
            }
        }

    });

    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // 默认执行的任务
    grunt.registerTask('default', ['uglify', 'cssmin']);

};